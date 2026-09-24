import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import DetailsPage from './pages/DetailsPage'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }

    // Intercept in-app link clicks for smooth client-side routing
    const handleLinkClick = (e) => {
      const target = e.target.closest('a')
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('download') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const url = new URL(target.href)
        // Check if internal route
        if (url.pathname.startsWith('/details/') || url.pathname === '/') {
          e.preventDefault()
          if (
            window.location.pathname !== url.pathname ||
            window.location.search !== url.search
          ) {
            window.history.pushState({}, '', url.pathname + url.search)
            setCurrentPath(url.pathname)
            window.dispatchEvent(new PopStateEvent('popstate'))
            if (url.pathname.startsWith('/details/')) {
              window.scrollTo(0, 0)
            }
          }
        }
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  // Match /details/:type/:id route
  const detailsMatch = currentPath.match(/^\/details\/([^/]+)\/([^/]+)/)

  if (detailsMatch) {
    const [, type, id] = detailsMatch
    return <DetailsPage type={type} id={id} />
  }

  return <HomePage />
}

export default App
