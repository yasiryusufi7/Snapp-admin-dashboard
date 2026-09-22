import { useEffect, useRef } from 'react'

export function useClickOutside(ref, handler, active = true) {
  const saved = useRef(handler)
  saved.current = handler

  useEffect(() => {
    if (!active) return undefined
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      saved.current(e)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, active])
}