import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import SearchBar from '../components/SearchBar'
import CountrySelector from '../components/CountrySelector'
import MediaCard from '../components/MediaCard'
import { searchMedia } from '../services/tmdb'
import {
  saveSearchState,
  getSearchState,
  getSavedScrollPosition,
} from '../services/searchState'

export default function HomePage() {
  // Read initial query parameter from URL on mount
  const initialUrlQuery = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('query') || new URLSearchParams(window.location.search).get('q') || '').trim()
    : ''

  const cachedState = initialUrlQuery ? getSearchState() : null
  const hasCachedMatch = Boolean(
    cachedState &&
    cachedState.query &&
    cachedState.query.toLowerCase() === initialUrlQuery.toLowerCase() &&
    Array.isArray(cachedState.results) &&
    cachedState.results.length > 0
  )

  const [activeQuery, setActiveQuery] = useState(hasCachedMatch ? cachedState.query : initialUrlQuery)
  const [results, setResults] = useState(hasCachedMatch ? cachedState.results : [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(hasCachedMatch)

  const activeQueryRef = useRef(activeQuery)
  const resultsRef = useRef(results)

  useEffect(() => {
    activeQueryRef.current = activeQuery
    resultsRef.current = results
  }, [activeQuery, results])

  const executeSearch = useCallback(async (query, updateUrl = true) => {
    const trimmed = (query || '').trim()
    if (!trimmed) {
      setActiveQuery('')
      setResults([])
      setHasSearched(false)
      setError(null)
      if (updateUrl && window.location.search) {
        window.history.pushState({}, '', '/')
      }
      return
    }

    if (updateUrl) {
      const newUrl = `/?query=${encodeURIComponent(trimmed)}`
      if (window.location.pathname + window.location.search !== newUrl) {
        window.history.pushState({}, '', newUrl)
      }
    }

    setIsLoading(true)
    setError(null)
    setActiveQuery(trimmed)
    setHasSearched(true)

    try {
      const data = await searchMedia(trimmed)
      setResults(data)
      saveSearchState(trimmed, data, 0)
    } catch {
      setError('Something went wrong. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Restore scroll position on initial load if returning to matching cached results
  useEffect(() => {
    if (hasCachedMatch) {
      const savedY = getSavedScrollPosition()
      if (savedY > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' })
        }, 30)
      }
    }
  }, [hasCachedMatch])

  // Read URL query parameter on initial load and upon popstate (back/forward history navigation).
  useEffect(() => {
    const readUrlAndSearch = () => {
      // Ignore popstate events that belong to other routes (e.g. /details/...)
      if (window.location.pathname !== '/') return

      const params = new URLSearchParams(window.location.search)
      const queryParam = (params.get('query') || params.get('q') || '').trim()

      if (queryParam) {
        // If current state already matches and has results, avoid refetching
        if (
          activeQueryRef.current.toLowerCase() === queryParam.toLowerCase() &&
          resultsRef.current.length > 0
        ) {
          const savedY = getSavedScrollPosition()
          if (savedY > 0) {
            setTimeout(() => {
              window.scrollTo({ top: savedY, behavior: 'instant' })
            }, 30)
          }
          return
        }

        // Check cache before performing network request
        const cached = getSearchState()
        if (
          cached &&
          cached.query &&
          cached.query.toLowerCase() === queryParam.toLowerCase() &&
          Array.isArray(cached.results) &&
          cached.results.length > 0
        ) {
          setActiveQuery(cached.query)
          setResults(cached.results)
          setHasSearched(true)
          setIsLoading(false)
          setError(null)

          const savedY = getSavedScrollPosition()
          if (savedY > 0) {
            setTimeout(() => {
              window.scrollTo({ top: savedY, behavior: 'instant' })
            }, 30)
          }
          return
        }

        // If not in state and not in cache, execute search
        executeSearch(queryParam, false)
      } else {
        setActiveQuery('')
        setResults([])
        setHasSearched(false)
        setError(null)
      }
    }

    // Only run if not already matching cached query on initial mount
    if (!hasCachedMatch && initialUrlQuery) {
      readUrlAndSearch()
    }

    window.addEventListener('popstate', readUrlAndSearch)
    return () => window.removeEventListener('popstate', readUrlAndSearch)
  }, [executeSearch, hasCachedMatch, initialUrlQuery])

  const handleSearch = (query) => {
    executeSearch(query, true)
  }

  return (
    <div className="home-container">
      {/* Top Header with country region selector */}
      <header className="home-header">
        <a href="/" className="header-brand" title="WatchWise Home">
          <span className="brand-icon" role="img" aria-label="Popcorn">
            🍿
          </span>
          <span className="brand-name">WatchWise</span>
        </a>

        <div className="header-actions">
          <CountrySelector />
        </div>
      </header>

      {/* Main Hero Section */}
      <main className={`hero-section ${hasSearched ? 'hero-compact' : ''}`}>
        <div className="hero-content">
          {/* Main Logo & Title */}
          <motion.div
            className="hero-branding"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="hero-popcorn" role="img" aria-label="Popcorn">
              🍿
            </span>
            <h1 className="hero-title">WatchWise</h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
          >
            Find it. Know it. Watch it.
          </motion.p>

          {/* Supporting Text */}
          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' }}
          >
            Discover movies, anime, series and dramas in one place.
          </motion.p>

          {/* Centered Search Bar */}
          <div className="hero-search-wrapper">
            <SearchBar onSearch={handleSearch} initialQuery={activeQuery} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* Search States & Results Container */}
      <section className="search-section-wrapper" aria-live="polite">
        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="search-status loading-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-spinner" aria-hidden="true" />
            <p className="status-text">Searching...</p>
          </motion.div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <motion.div
            className="search-status error-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="status-icon" aria-hidden="true">⚠️</span>
            <p className="status-text">{error}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <motion.div
            className="search-status empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="status-icon" aria-hidden="true">🔍</span>
            <p className="status-text">No results found.</p>
          </motion.div>
        )}

        {/* Results Grid State */}
        {!isLoading && !error && hasSearched && results.length > 0 && (
          <motion.div
            className="search-results-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="search-results-header">
              <h2 className="search-results-title">
                Search results for <span className="query-highlight">"{activeQuery}"</span>
              </h2>
              <span className="search-results-count">{results.length} items found</span>
            </div>

            <div className="media-grid">
              {results.map((item) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  media={item}
                  searchQuery={activeQuery}
                />
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  )
}
