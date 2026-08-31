import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

export default function SearchBar({ onSearch, initialQuery = '', isLoading = false }) {
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      return
    }

    if (onSearch) {
      onSearch(trimmed)
    }
  }

  return (
    <motion.form
      className="search-bar-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
    >
      <div className="search-bar-wrapper">
        <span className="search-bar-icon" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          type="text"
          className="search-bar-input"
          placeholder="Search movies, anime, series..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search movies, anime, series"
        />

        <motion.button
          type="submit"
          className="search-bar-button"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </motion.button>
      </div>
    </motion.form>
  )
}
