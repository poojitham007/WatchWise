import { motion } from 'motion/react'

export default function ProviderCard({ provider, type = 'stream' }) {
  if (!provider) return null

  const logoUrl = provider.logo_path
    ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
    : null

  return (
    <motion.div
      className="provider-card"
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.2 }}
      title={`${provider.provider_name} (${type})`}
    >
      <div className="provider-logo-container">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={provider.provider_name}
            className="provider-logo"
            loading="lazy"
          />
        ) : (
          <div className="provider-logo-fallback">
            <span>📺</span>
          </div>
        )}
      </div>
      <span className="provider-name">{provider.provider_name}</span>
    </motion.div>
  )
}
