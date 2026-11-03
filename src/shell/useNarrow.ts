import { useEffect, useState } from 'react'

function matchesQuery(query: string) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

export function useNarrow(query = '(max-width: 48rem)') {
  const [narrow, setNarrow] = useState(() => matchesQuery(query))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(query)
    const onChange = () => setNarrow(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return narrow
}
