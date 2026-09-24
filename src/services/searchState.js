/**
 * Session storage manager for search state and navigation preservation.
 * Keeps previous search query, results array, and scroll offset intact
 * across client-side route transitions and page refreshes.
 */

const SEARCH_STATE_KEY = 'watchwise_search_cache'
const SCROLL_POS_KEY = 'watchwise_scroll_position'
const NAV_FLAG_KEY = 'watchwise_from_search'

/**
 * Persists the latest search query and its fetched results into sessionStorage.
 *
 * @param {string} query
 * @param {Array} results
 * @param {number} [scrollY=0]
 */
export function saveSearchState(query, results, scrollY = 0) {
  try {
    const payload = {
      query: (query || '').trim(),
      results: Array.isArray(results) ? results : [],
      scrollY: typeof scrollY === 'number' ? scrollY : 0,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(payload))
  } catch {
    // Gracefully handle storage quota or privacy restrictions
  }
}

/**
 * Retrieves the currently saved search state.
 *
 * @returns {{ query: string, results: Array, scrollY: number, timestamp: number } | null}
 */
export function getSearchState() {
  try {
    const raw = sessionStorage.getItem(SEARCH_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.query === 'string' && Array.isArray(parsed.results)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Updates just the scroll position in the saved search state.
 *
 * @param {number} scrollY
 */
export function updateScrollPosition(scrollY) {
  try {
    sessionStorage.setItem(SCROLL_POS_KEY, String(Math.max(0, Math.round(scrollY || 0))))
    const current = getSearchState()
    if (current) {
      current.scrollY = Math.max(0, Math.round(scrollY || 0))
      sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(current))
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Retrieves the last recorded scroll position.
 *
 * @returns {number}
 */
export function getSavedScrollPosition() {
  try {
    const raw = sessionStorage.getItem(SCROLL_POS_KEY)
    if (raw !== null) {
      const parsed = parseInt(raw, 10)
      return isNaN(parsed) ? 0 : parsed
    }
    const state = getSearchState()
    return state ? state.scrollY || 0 : 0
  } catch {
    return 0
  }
}

/**
 * Fast helper to obtain the last search query.
 *
 * @returns {string}
 */
export function getSavedQuery() {
  const state = getSearchState()
  return state ? state.query : ''
}

/**
 * Marks whether navigation to the details page originated from search results.
 *
 * @param {boolean} flag
 */
export function setNavigatedFromSearch(flag) {
  try {
    if (flag) {
      sessionStorage.setItem(NAV_FLAG_KEY, 'true')
    } else {
      sessionStorage.removeItem(NAV_FLAG_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks if the current visit to details originated from search results.
 *
 * @returns {boolean}
 */
export function wasNavigatedFromSearch() {
  try {
    return sessionStorage.getItem(NAV_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}
