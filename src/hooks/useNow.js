import { useEffect, useState } from 'react'

/** Ticks every `interval` ms and returns the current epoch ms. */
export function useNow(interval = 5000, enabled = true) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!enabled) return undefined
    const t = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(t)
  }, [interval, enabled])

  return now
}