import { FilterX } from 'lucide-react'
import { cx } from '../../utils/classNames'

export function FilterBar({ children, onClear, title = 'Filters', className, dirty = false }) {
  return (
    <div className={cx('card-surface px-4 py-3', className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scroll-thin">
        {title && <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{title}</span>}
        {children}
        {onClear && dirty && (
          <button
            onClick={onClear}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface3 hover:text-ink"
          >
            <FilterX className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options, className, placeholder }) {
  return (
    <label className={cx('flex shrink-0 items-center gap-1.5', className)}>
      <span className="text-xs font-medium text-ink-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-8 rounded-md border border-line bg-surface pl-2 pr-7 text-[13px] text-ink transition hover:border-line-strong"
      >
        {placeholder != null && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}