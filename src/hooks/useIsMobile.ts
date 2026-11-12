import { useEffect, useState } from 'react'

/** Must match the breakpoint in styles/global.css. */
const QUERY = '(max-width: 820px)'

/** True on phone-sized screens; updates when the window is resized. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = () => setIsMobile(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
