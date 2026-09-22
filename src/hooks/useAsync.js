import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async producer with loading / error / reload lifecycle.
 * Returns { data, loading, error, reload, mutate }.
 */
export function useAsync(fn, deps = [], opts = {}) {
  const [data, setData] = useState(opts.initial ?? null)
  const [loading, setLoading] = useState(!opts.skip)
  const [error, setError] = useState(null)
  const fnRef = useRef(fn)
  fnRef.current = fn
  const mounted = useRef(true)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fnRef.current()
      if (mounted.current) setData(result)
    } catch (e) {
      if (mounted.current) setError(e)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    run()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const mutate = useCallback((updater) => {
    setData((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  return { data, loading, error, reload: run, mutate }
}