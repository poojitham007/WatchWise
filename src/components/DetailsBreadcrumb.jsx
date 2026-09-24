import { wasNavigatedFromSearch, setNavigatedFromSearch } from '../services/searchState'

/**
 * Modern pill-style breadcrumb navigation for DetailsPage.
 * Structure: ← Search Results / [Query]
 *
 * - "Search Results" (including arrow) is the clickable link.
 * - [Query] represents the previous search term (non-clickable).
 * - Gracefully falls back to "← Search Results" when accessed without a prior search query.
 */
export default function DetailsBreadcrumb({ previousQuery = '' }) {
  const cleanQuery = (previousQuery || '').trim()
  const targetUrl = cleanQuery ? `/?query=${encodeURIComponent(cleanQuery)}` : '/'

  const handleClick = (e) => {
    // If not a modified click (ctrl/cmd/shift), handle in-app client-side navigation
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
    e.preventDefault()

    const fromSearch = wasNavigatedFromSearch()
    setNavigatedFromSearch(false)

    // If navigated in-session from search results, use history.back() for exact history state restoration
    if (window.history.length > 1 && fromSearch) {
      window.history.back()
    } else {
      // Direct navigation / refreshed state fallback
      if (
        window.location.pathname !== '/' ||
        window.location.search !== (cleanQuery ? `?query=${encodeURIComponent(cleanQuery)}` : '')
      ) {
        window.history.pushState({}, '', targetUrl)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }
  }

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb navigation">
      <div className="breadcrumb-pill">
        <a
          href={targetUrl}
          onClick={handleClick}
          className="breadcrumb-link"
          id="breadcrumb-search-results"
          aria-label={cleanQuery ? `Back to search results for ${cleanQuery}` : 'Back to search results'}
        >
          <span className="breadcrumb-arrow" aria-hidden="true">
            ←
          </span>
          <span className="breadcrumb-text">Search Results</span>
        </a>

        {cleanQuery && (
          <>
            <span className="breadcrumb-separator" aria-hidden="true">
              /
            </span>
            <span className="breadcrumb-query" title={cleanQuery}>
              {cleanQuery}
            </span>
          </>
        )}
      </div>
    </nav>
  )
}
