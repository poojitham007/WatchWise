import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Custom Vite plugin to provide a secure server-side API layer for TMDB.
 * This keeps TMDB credentials private and prevents exposing them to client-side code.
 */
function tmdbApiPlugin() {
  return {
    name: 'tmdb-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, 'http://localhost')

        // Handle Search Endpoint
        if (parsedUrl.pathname === '/api/search') {
          const query = (parsedUrl.searchParams.get('query') || parsedUrl.searchParams.get('q') || '').trim()

          if (!query) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Search query is required' }))
            return
          }

          // Dynamically read env on request to always have current variables
          const env = loadEnv(server.config.mode || 'development', process.cwd(), '')
          const apiKey = env.TMDB_API_KEY
          const accessToken = env.TMDB_ACCESS_TOKEN

          if (!apiKey && !accessToken) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'TMDB credentials are not configured on the server' }))
            return
          }

          try {
            const tmdbUrl = new URL('https://api.themoviedb.org/3/search/multi')
            tmdbUrl.searchParams.set('query', query)
            tmdbUrl.searchParams.set('include_adult', 'false')
            tmdbUrl.searchParams.set('language', 'en-US')
            tmdbUrl.searchParams.set('page', '1')

            const headers = {
              Accept: 'application/json',
            }

            if (accessToken) {
              headers.Authorization = `Bearer ${accessToken}`
            } else if (apiKey) {
              tmdbUrl.searchParams.set('api_key', apiKey)
            }

            const tmdbRes = await fetch(tmdbUrl.toString(), { headers })

            if (!tmdbRes.ok) {
              res.statusCode = tmdbRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch search results from TMDB' }))
              return
            }

            const data = await tmdbRes.json()

            // Filter only movie and tv items (ignore person results) and normalize properties
            const filteredResults = (data.results || [])
              .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
              .map((item) => ({
                id: item.id,
                media_type: item.media_type,
                title: item.title || item.name || 'Untitled',
                poster_path: item.poster_path || null,
                vote_average: typeof item.vote_average === 'number' ? item.vote_average : 0,
                release_date: item.release_date || item.first_air_date || '',
                release_year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
                overview: item.overview || '',
              }))

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ results: filteredResults }))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error while searching' }))
          }
          return
        }

        // Handle Details Endpoint
        if (parsedUrl.pathname === '/api/details') {
          const type = (parsedUrl.searchParams.get('type') || '').trim().toLowerCase()
          const id = (parsedUrl.searchParams.get('id') || '').trim()

          if (!type || !id || (type !== 'movie' && type !== 'tv')) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Valid media type (movie or tv) and media ID are required' }))
            return
          }

          const env = loadEnv(server.config.mode || 'development', process.cwd(), '')
          const apiKey = env.TMDB_API_KEY
          const accessToken = env.TMDB_ACCESS_TOKEN

          if (!apiKey && !accessToken) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'TMDB credentials are not configured on the server' }))
            return
          }

          try {
            const tmdbUrl = new URL(`https://api.themoviedb.org/3/${type}/${id}`)
            tmdbUrl.searchParams.set('append_to_response', 'credits,watch/providers')
            tmdbUrl.searchParams.set('language', 'en-US')

            const headers = {
              Accept: 'application/json',
            }

            if (accessToken) {
              headers.Authorization = `Bearer ${accessToken}`
            } else if (apiKey) {
              tmdbUrl.searchParams.set('api_key', apiKey)
            }

            const tmdbRes = await fetch(tmdbUrl.toString(), { headers })

            if (!tmdbRes.ok) {
              res.statusCode = tmdbRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch media details from TMDB' }))
              return
            }

            const data = await tmdbRes.json()

            // Normalize details data
            const isMovie = type === 'movie'
            const normalizedDetails = {
              id: data.id,
              media_type: type,
              title: isMovie ? data.title || 'Untitled' : data.name || 'Untitled',
              poster_path: data.poster_path || null,
              backdrop_path: data.backdrop_path || null,
              vote_average: typeof data.vote_average === 'number' ? data.vote_average : 0,
              genres: (data.genres || []).map((g) => g.name),
              release_date: isMovie ? data.release_date || '' : data.first_air_date || '',
              release_year: (isMovie ? data.release_date || '' : data.first_air_date || '').split('-')[0] || '',
              status: data.status || 'Released',
              overview: data.overview || '',
              // Top cast members
              cast: (data.credits?.cast || []).slice(0, 15).map((c) => ({
                id: c.id,
                name: c.name,
                character: c.character || '',
                profile_path: c.profile_path || null,
              })),
              // TV-specific fields (exclude duration)
              number_of_seasons: isMovie ? null : data.number_of_seasons || 0,
              number_of_episodes: isMovie ? null : data.number_of_episodes || 0,
              seasons: isMovie
                ? []
                : (data.seasons || []).map((s) => ({
                    id: s.id,
                    name: s.name,
                    season_number: s.season_number,
                    episode_count: s.episode_count,
                    poster_path: s.poster_path || null,
                    air_date: s.air_date || '',
                    overview: s.overview || '',
                  })),
              // Watch providers by country
              watch_providers: data['watch/providers']?.results || {},
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(normalizedDetails))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error while fetching details' }))
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tmdbApiPlugin()],
})
