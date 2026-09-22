import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounced } from './useDebounced'

/**
 * Shared query state for list pages — search, sort, filter, pagination.
 * Designed to map 1:1 onto the service layer's `list()` params.
 */
export function useListState({ defaultSort = null, defaultDir = 'asc', defaultPageSize = 10, searchDelay = 240 } = {}) {
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search, searchDelay)
  const [sort, setSort] = useState(defaultSort)
  const [dir, setDir] = useState(defaultDir)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [filters, setFilters] = useState({})
  const [selected, setSelected] = useState([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [debounced, sort, dir, pageSize])

  const params = useMemo(
    () => ({ search: debounced, sort, dir, page, pageSize, filters, version }),
    [debounced, sort, dir, page, pageSize, filters, version],
  )

  const onSort = useCallback(({ key, dir: nextDir }) => {
    if (sort === key) setDir(nextDir)
    else {
      setSort(key)
      setDir(nextDir)
    }
  }, [sort])

  const setFilter = useCallback((key, value) => {
    setFilters((f) => {
      const next = { ...f, [key]: value || undefined }
      return next
    })
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearch('')
    setPage(1)
  }, [])

  const clearSelection = useCallback(() => setSelected([]), [])
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { search, setSearch, sort, dir, onSort, page, setPage, pageSize, setPageSize, filters, setFilter, clearFilters, params, dirty: Object.values(filters).some(Boolean), selected, setSelected, clearSelection, reload }
}