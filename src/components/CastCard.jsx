import { motion } from 'motion/react'

export default function CastCard({ member }) {
  if (!member) return null

  const profileUrl = member.profile_path
    ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
    : null

  return (
    <motion.div
      className="cast-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="cast-photo-container">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={member.name}
            className="cast-photo"
            loading="lazy"
          />
        ) : (
          <div className="cast-photo-fallback">
            <span className="fallback-avatar-icon" aria-hidden="true">👤</span>
          </div>
        )}
      </div>
      <div className="cast-details">
        <h4 className="cast-name" title={member.name}>{member.name}</h4>
        {member.character && (
          <p className="cast-character" title={member.character}>
            {member.character}
          </p>
        )}
      </div>
    </motion.div>
  )
}
