import axios from 'axios'

export const handler = async (event) => {
  const type = (event.queryStringParameters?.type || '').trim().toLowerCase()
  const id = (event.queryStringParameters?.id || '').trim()

  if (!type || !id || (type !== 'movie' && type !== 'tv')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Valid media type (movie or tv) and media ID are required' })
    }
  }

  const apiKey = process.env.TMDB_API_KEY
  const accessToken = process.env.TMDB_ACCESS_TOKEN

  if (!apiKey && !accessToken) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'TMDB credentials are not configured on the server' })
    }
  }

  try {
    const params = {
      append_to_response: 'credits,watch/providers',
      language: 'en-US',
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
      tmdbRes = await axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
        params,
        headers,
        timeout: 8000,
      })
    } catch (err) {
      if (err.code === 'ECONNRESET' || !err.response) {
        tmdbRes = await axios.get(`https://api.tmdb.org/3/${type}/${id}`, {
          params,
          headers,
          timeout: 8000,
        })
      } else {
        throw err
      }
    }

    const data = tmdbRes.data

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
      cast: (data.credits?.cast || []).slice(0, 15).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profile_path: c.profile_path || null,
      })),
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
      watch_providers: data['watch/providers']?.results || {},
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedDetails)
    }
  } catch (error) {
    const status = error.response ? error.response.status : 500
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error while fetching details' })
    }
  }
}
