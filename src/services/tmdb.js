/**
 * TMDB API client service.
 * Makes requests to the local server-side API endpoints (/api/search, /api/details)
 * so TMDB credentials remain secure on the server side.
 */

/**
 * Searches for movies and TV series matching the search query.
 *
 * @param {string} query - The search text
 * @returns {Promise<Array>} Array of normalized movie and TV results
 */
export async function searchMedia(query) {
  const trimmedQuery = (query || '').trim()

  if (!trimmedQuery) {
    return []
  }

  const response = await fetch(`/api/search?query=${encodeURIComponent(trimmedQuery)}`)

  if (!response.ok) {
    throw new Error('Search request failed')
  }

  const data = await response.json()
  return data.results || []
}

/**
 * Fetches full details for a movie or TV show including cast and watch providers.
 *
 * @param {string} type - 'movie' or 'tv'
 * @param {string|number} id - TMDB Media ID
 * @returns {Promise<Object>} Detailed media object
 */
export async function getMediaDetails(type, id) {
  if (!type || !id) {
    throw new Error('Media type and ID are required')
  }

  const response = await fetch(`/api/details?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch media details')
  }

  const data = await response.json()
  return data
}
