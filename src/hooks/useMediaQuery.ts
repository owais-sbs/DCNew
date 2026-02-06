import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const m = window.matchMedia(query)
    setMatches(m.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    m.addEventListener("change", handler)
    return () => m.removeEventListener("change", handler)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)")
