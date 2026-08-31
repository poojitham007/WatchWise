import { motion } from 'motion/react'

export default function SeasonCard({ season }) {
  if (!season) return null

  const posterUrl = season.poster_path
    ? `https://image.tmdb.org/t/p/w185${season.poster_path}`
    : null
  const airYear = season.air_date ? season.air_date.split('-')[0] : null

  return (
    <motion.div
      className="season-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="season-poster-container">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={season.name}
            className="season-poster"
            loading="lazy"
          />
        ) : (
          <div className="season-poster-fallback">
            <span aria-hidden="true">🎬</span>
          </div>
        )}
      </div>

      <div className="season-details">
        <div className="season-header">
          <h4 className="season-name">{season.name}</h4>
          {airYear && <span className="season-year">{airYear}</span>}
        </div>

        <div className="season-meta">
          <span className="season-episodes-count">
            {season.episode_count} {season.episode_count === 1 ? 'Episode' : 'Episodes'}
          </span>
        </div>

        {season.overview && (
          <p className="season-overview">{season.overview}</p>
        )}
      </div>
    </motion.div>
  )
}
