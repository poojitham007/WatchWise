import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { getMediaDetails } from '../services/tmdb'
import CastCard from '../components/CastCard'
import ProviderCard from '../components/ProviderCard'
import SeasonCard from '../components/SeasonCard'
import CountrySelector, { COUNTRIES } from '../components/CountrySelector'

export default function DetailsPage({ type, id }) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('IN')

  useEffect(() => {
    let isMounted = true

    async function fetchDetails() {
      if (!type || !id) {
        setError('Invalid media selection.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await getMediaDetails(type, id)
        if (isMounted) {
          setDetails(data)
        }
      } catch {
        if (isMounted) {
          setError('Failed to load details. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDetails()

    return () => {
      isMounted = false
    }
  }, [type, id])

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="details-page-loading">
        <header className="details-header">
          <button type="button" onClick={handleBack} className="back-button">
            ← Back
          </button>
          <a href="/" className="header-brand">
            <span className="brand-icon">🍿</span>
            <span className="brand-name">WatchWise</span>
          </a>
        </header>

        <div className="details-loading-spinner-container">
          <div className="search-spinner" aria-hidden="true" />
          <p className="loading-text">Loading details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !details) {
    return (
      <div className="details-page-error">
        <header className="details-header">
          <button type="button" onClick={handleBack} className="back-button">
            ← Back
          </button>
          <a href="/" className="header-brand">
            <span className="brand-icon">🍿</span>
            <span className="brand-name">WatchWise</span>
          </a>
        </header>

        <div className="details-error-container">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <h2>{error || 'Media not found.'}</h2>
          <button type="button" onClick={handleBack} className="error-back-btn">
            Return to Search
          </button>
        </div>
      </div>
    )
  }

  const isMovie = details.media_type === 'movie'
  const typeLabel = isMovie ? 'Movie' : 'TV Series'
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null
  const posterUrl = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null
  const backdropUrl = details.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : null

  // Watch Provider Data for Selected Country
  const countryProviders = details.watch_providers?.[selectedCountry] || null
  const streamProviders = countryProviders?.flatrate || []
  const freeProviders = countryProviders?.free || countryProviders?.ads || []
  const buyRentProviders = [
    ...(countryProviders?.buy || []),
    ...(countryProviders?.rent || []),
  ].filter((p, index, self) => index === self.findIndex((t) => t.provider_id === p.provider_id))

  const countryMeta = COUNTRIES.find((c) => c.code === selectedCountry) || { name: 'Selected Region', flag: '🌍' }
  const officialWatchLink = countryProviders?.link || null

  return (
    <div className="details-page-container">
      {/* Backdrop Ambient Image */}
      {backdropUrl && (
        <div className="details-backdrop-wrapper" aria-hidden="true">
          <img src={backdropUrl} alt="" className="details-backdrop-img" />
          <div className="details-backdrop-gradient" />
        </div>
      )}

      {/* Details Header Navigation */}
      <header className="details-header">
        <button type="button" onClick={handleBack} className="back-button" aria-label="Go back">
          ← Back
        </button>

        <a href="/" className="header-brand" title="WatchWise Home">
          <span className="brand-icon">🍿</span>
          <span className="brand-name">WatchWise</span>
        </a>

        <div className="header-actions">
          <CountrySelector
            selectedCountryCode={selectedCountry}
            onSelectCountry={(code) => setSelectedCountry(code)}
          />
        </div>
      </header>

      {/* Main Details Hero */}
      <main className="details-main-content">
        <section className="details-hero-section">
          {/* Left Column: Poster */}
          <motion.div
            className="details-poster-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={details.title}
                className="details-poster-image"
              />
            ) : (
              <div className="details-poster-fallback">
                <span aria-hidden="true">🎬</span>
                <span>No Poster</span>
              </div>
            )}
          </motion.div>

          {/* Right Column: Information */}
          <motion.div
            className="details-info-column"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="details-badges-row">
              <span className={`media-type-badge ${isMovie ? 'badge-movie' : 'badge-tv'}`}>
                {typeLabel}
              </span>
              {details.status && (
                <span className="details-status-badge">{details.status}</span>
              )}
              {rating && (
                <span className="media-rating-badge">
                  <span className="star-icon" aria-hidden="true">★</span>
                  {rating} / 10
                </span>
              )}
            </div>

            <h1 className="details-title">{details.title}</h1>

            <div className="details-meta-row">
              {details.release_year && (
                <span className="details-year">{details.release_year}</span>
              )}
              {details.release_date && details.release_date !== details.release_year && (
                <span className="details-full-date">({details.release_date})</span>
              )}
            </div>

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
              <div className="details-genres-list">
                {details.genres.map((genre) => (
                  <span key={genre} className="genre-pill">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* TV Series Statistics (Excluded for movies) */}
            {!isMovie && (
              <div className="details-tv-stats">
                <div className="tv-stat-item">
                  <span className="stat-value">{details.number_of_seasons}</span>
                  <span className="stat-label">
                    {details.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                </div>
                <div className="tv-stat-divider" />
                <div className="tv-stat-item">
                  <span className="stat-value">{details.number_of_episodes}</span>
                  <span className="stat-label">Episodes</span>
                </div>
              </div>
            )}

            {/* Overview */}
            {details.overview && (
              <div className="details-overview-section">
                <h3 className="section-subtitle">Overview</h3>
                <p className="details-overview-text">{details.overview}</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Where to Watch (Watch Providers) Section */}
        <section className="details-providers-section">
          <div className="providers-section-header">
            <div className="providers-title-group">
              <h2 className="section-title">Where to Watch</h2>
              <span className="providers-region-indicator">
                in {countryMeta.flag} {countryMeta.name}
              </span>
            </div>

            {officialWatchLink && (
              <a
                href={officialWatchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="official-watch-link"
              >
                Watch on Provider ↗
              </a>
            )}
          </div>

          {/* Streaming / Subscription Providers */}
          {streamProviders.length > 0 && (
            <div className="provider-category-group">
              <h4 className="provider-category-title">Stream</h4>
              <div className="providers-grid">
                {streamProviders.map((provider) => (
                  <ProviderCard
                    key={`stream-${provider.provider_id}`}
                    provider={provider}
                    type="Streaming"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Free / Ads Providers */}
          {freeProviders.length > 0 && (
            <div className="provider-category-group">
              <h4 className="provider-category-title">Free with Ads</h4>
              <div className="providers-grid">
                {freeProviders.map((provider) => (
                  <ProviderCard
                    key={`free-${provider.provider_id}`}
                    provider={provider}
                    type="Free"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Buy or Rent Providers */}
          {buyRentProviders.length > 0 && (
            <div className="provider-category-group">
              <h4 className="provider-category-title">Rent / Buy</h4>
              <div className="providers-grid">
                {buyRentProviders.map((provider) => (
                  <ProviderCard
                    key={`buy-${provider.provider_id}`}
                    provider={provider}
                    type="Buy/Rent"
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Providers Available State for Selected Region */}
          {!streamProviders.length && !freeProviders.length && !buyRentProviders.length && (
            <div className="providers-empty-state">
              <span className="empty-globe-icon" aria-hidden="true">📺</span>
              <p>
                No streaming providers currently listed for {countryMeta.flag} {countryMeta.name}.
              </p>
              {officialWatchLink ? (
                <a
                  href={officialWatchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="empty-watch-link"
                >
                  Check global availability on JustWatch ↗
                </a>
              ) : (
                <span className="empty-subtext">Try selecting another country region above.</span>
              )}
            </div>
          )}
        </section>

        {/* TV Series Seasons & Episodes (Excluded for movies) */}
        {!isMovie && details.seasons && details.seasons.length > 0 && (
          <section className="details-seasons-section">
            <h2 className="section-title">Seasons ({details.seasons.length})</h2>
            <div className="seasons-list">
              {details.seasons.map((season) => (
                <SeasonCard key={`season-${season.id || season.season_number}`} season={season} />
              ))}
            </div>
          </section>
        )}

        {/* Top Cast Section */}
        {details.cast && details.cast.length > 0 && (
          <section className="details-cast-section">
            <h2 className="section-title">Top Cast</h2>
            <div className="cast-grid">
              {details.cast.map((member) => (
                <CastCard key={`cast-${member.id}`} member={member} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
