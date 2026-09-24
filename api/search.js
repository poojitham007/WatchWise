import axios from 'axios'

export default async function handler(req, res) {
  const query = (req.query.query || req.query.q || '').trim()

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' })
  }

  const apiKey = process.env.TMDB_API_KEY
  const accessToken = process.env.TMDB_ACCESS_TOKEN

  if (!apiKey && !accessToken) {
    return res.status(500).json({ error: 'TMDB credentials are not configured on the server' })
  }

  try {
    const params = {
      query,
      include_adult: 'false',
      language: 'en-US',
      page: '1',
    }

    const headers = {
      Accept: 'application/json',
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    } else if (apiKey) {
      params.api_key = apiKey
    }

    let tmdbRes
    try {
      tmdbRes = await axios.get('https://api.themoviedb.org/3/search/multi', {
        params,
        headers,
        timeout: 8000,
      })
    } catch (err) {
      if (err.code === 'ECONNRESET' || !err.response) {
        tmdbRes = await axios.get('https://api.tmdb.org/3/search/multi', {
          params,
          headers,
          timeout: 8000,
        })
      } else {
        throw err
      }
    }

    const data = tmdbRes.data

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

    return res.status(200).json({ results: filteredResults })
  } catch (error) {
    const status = error.response ? error.response.status : 500
    return res.status(status).json({ error: 'Internal server error while searching' })
  }
}
