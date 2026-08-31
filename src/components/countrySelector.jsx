import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
]

export default function CountrySelector({ selectedCountryCode = 'IN', onSelectCountry }) {
  const [internalCountry, setInternalCountry] = useState(selectedCountryCode)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeCode = selectedCountryCode || internalCountry
  const currentCountry = COUNTRIES.find((c) => c.code === activeCode) || COUNTRIES[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (country) => {
    setInternalCountry(country.code)
    if (onSelectCountry) {
      onSelectCountry(country.code)
    }
    setIsOpen(false)
  }

  return (
    <div className="country-selector-container" ref={dropdownRef}>
      <button
        type="button"
        className="country-selector-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Select streaming country"
        title="Change streaming region"
      >
        <span className="country-globe-icon" aria-hidden="true">🌍</span>
        <span className="country-current-name">
          {currentCountry.flag} {currentCountry.name}
        </span>
        <svg
          className={`country-chevron ${isOpen ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="country-dropdown-menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="country-dropdown-header">Streaming Region</div>
            <div className="country-dropdown-list">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`country-option-item ${
                    currentCountry.code === country.code ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(country)}
                >
                  <span className="country-flag">{country.flag}</span>
                  <span className="country-name">{country.name}</span>
                  {currentCountry.code === country.code && (
                    <span className="country-check" aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}