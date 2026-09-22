import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useTheme() {
  const [mode, setMode] = useLocalStorage('snapp.theme', 'light')

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [mode])

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), [setMode])
  const systemPref = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && systemPref)

  return { mode, isDark, toggle, setMode }
}