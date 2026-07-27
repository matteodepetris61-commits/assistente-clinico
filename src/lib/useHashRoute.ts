import { useEffect, useState } from 'react'

export function getHash(): string {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function navigate(path: string): void {
  window.location.hash = path
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(getHash())

  useEffect(() => {
    const onHashChange = () => setRoute(getHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
