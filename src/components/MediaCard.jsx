import { motion } from 'motion/react'
import { updateScrollPosition, setNavigatedFromSearch, getSavedQuery } from '../services/searchState'

export default function MediaCard({ media, searchQuery }) {
  if (!media) return null

  const isMovie = media.media_type === 'movie'
  const typeLabel = isMovie ? 'Movie' : 'TV'
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : null

  const activeSearch = searchQuery || getSavedQuery()
  const detailsHref = `/details/${media.media_type}/${media.id}${
    activeSearch ? `?from=${encodeURIComponent(activeSearch)}` : ''
  }`

  const handleClick = () => {
    updateScrollPosition(window.scrollY)
    setNavigatedFromSearch(true)
  }

  return (
    <motion.div
      className="media-card-wrapper"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <a href={detailsHref} onClick={handleClick} className="media-card" title={media.title}>
        <div className="media-poster-container">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={media.title}
              className="media-poster"
              loading="lazy"
            />
          ) : (
            <div className="media-poster-fallback">
              <span className="fallback-icon" aria-hidden="true">🎬</span>
              <span className="fallback-text">No Poster</span>
            </div>
          )}

          {/* Type Badge */}
          <span className={`media-type-badge ${isMovie ? 'badge-movie' : 'badge-tv'}`}>
            {typeLabel}
          </span>

          {/* Rating Badge */}
          {rating && (
            <span className="media-rating-badge">
              <span className="star-icon" aria-hidden="true">★</span>
              {rating}
            </span>
          )}
        </div>

        <div className="media-info">
          <h3 className="media-title">{media.title}</h3>
          <div className="media-meta">
            <span className="media-year">{media.release_year || '—'}</span>
            <span className="media-category">{typeLabel}</span>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
