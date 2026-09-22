import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { fmtNumber } from '../../utils/format'

export function Pagination({ page, pages, total, pageSize, onPageChange, onPageSizeChange, className }) {
  const visible = []
  for (let i = Math.max(1, page - 1); i <= Math.min(pages, page + 2); i++) visible.push(i)
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(total, page * pageSize)

  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3', className)}>
      <div className="flex items-center gap-3">
        <p className="text-xs text-ink-soft">
          <span className="font-medium text-ink text-tabular">{fmtNumber(rangeStart)}–{fmtNumber(rangeEnd)}</span> of{' '}
          <span className="font-medium text-ink text-tabular">{fmtNumber(total)}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-faint">Rows</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="focus-ring h-7 rounded-md border border-line bg-surface px-1.5 text-xs text-ink"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <nav className="flex items-center gap-0.5" aria-label="Pagination">
          <button
            aria-label="First page"
            disabled={page <= 1}
            onClick={() => onPageChange?.(Math.max(1, page - 5))}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition hover:bg-surface3 disabled:opacity-40"
          >
            <ChevronsUpDown className="h-3.5 w-3.5 rotate-90" />
          </button>
          <button
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition hover:bg-surface3 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {visible.map((p) => (
            <button
              key={p}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange?.(p)}
              className={cx(
                'flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-semibold transition',
                p === page ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-surface3 hover:text-ink',
              )}
            >
              {p}
            </button>
          ))}
          <button
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => onPageChange?.(page + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition hover:bg-surface3 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}