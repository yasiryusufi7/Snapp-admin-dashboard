import { useMemo } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { Checkbox } from '../ui/Checkbox'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/States'

/**
 * Enterprise data table with sorting, selection, sticky headers and
 * density control. Sorting/selection are controlled from the parent so the
 * page owns the query state (which maps cleanly onto the service layer).
 */
export function DataTable({
  columns,
  rows = [],
  rowKey = 'id',
  loading = false,
  sort,
  dir,
  onSort,
  selectable = false,
  selected = [],
  onSelectionChange,
  onRowClick,
  stickyHeader = true,
  density = 'comfortable',
  empty = null,
  minWidth,
  headerClassName,
}) {
  const allSelected = useMemo(
    () => rows.length > 0 && selected.length === rows.length,
    [rows, selected],
  )
  const someSelected = selected.length > 0 && !allSelected

  const toggleAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : rows.map((r) => r[rowKey]))
  }
  const toggleRow = (id) => {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const selectableCells = selectable && onSelectionChange
  const rowPadding = density === 'compact' ? 'py-1.5' : 'py-2.5'

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[13px]" style={minWidth ? { minWidth } : undefined}>
        <thead className={cx(stickyHeader && 'sticky top-0 z-10', 'bg-surface2', headerClassName)}>
          <tr className="text-left">
            {selectableCells && (
              <th className="w-10 px-3 py-2.5">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} label="Select all rows" />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sort === col.key
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cx(
                    'border-b border-line px-3 font-semibold uppercase tracking-wide text-ink-faint',
                    'text-[11px] whitespace-nowrap',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.headerClassName,
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.({ key: col.key, dir: isSorted && dir === 'asc' ? 'desc' : 'asc' })}
                      className={cx(
                        'group inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-ink',
                        col.align === 'right' && 'flex-row-reverse',
                        isSorted && 'text-ink',
                      )}
                    >
                      {col.label}
                      {isSorted ? (
                        dir === 'asc' ? <ArrowUp className="h-3 w-3 text-brand-600" /> : <ArrowDown className="h-3 w-3 text-brand-600" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                      )}
                    </button>
                  ) : (
                    <span className={cx('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>{col.label}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: Math.min(rows.length || 8, 10) }).map((_, i) => (
                <tr key={i} className="border-b border-line/70">
                  {selectableCells && (
                    <td className="px-3 py-2.5"><Skeleton className="h-4 w-4" /></td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cx('px-3', rowPadding)}>
                      <Skeleton className={cx('h-3.5', i % 3 === 1 ? 'w-24' : 'w-32')} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const rowId = typeof rowKey === 'function' ? rowKey(row) : row[rowKey]
                const isSelected = selected.includes(rowId)
                const isClickable = !!onRowClick
                return (
                  <tr
                    key={rowId}
                    onClick={isClickable ? () => onRowClick(row) : undefined}
                    className={cx(
                      'group border-b border-line/70 transition-colors',
                      isClickable && 'cursor-pointer',
                      isSelected ? 'bg-brand-500/6' : 'hover:bg-surface2/70',
                    )}
                  >
                    {selectableCells && (
                      <td className="px-3 py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleRow(rowId)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cx(
                          'px-3 align-middle',
                          rowPadding,
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                          col.tabular && 'text-tabular',
                          col.className,
                        )}
                      >
                        {col.render ? col.render(row, col) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectableCells ? 1 : 0)}>
                {empty || <EmptyState title="No records found" description="Adjust your filters or search terms and try again." />}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}