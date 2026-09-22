import { cx } from '../../utils/classNames'

export function ChartCard({ title, description, actions, children, className, loading, skeleton = 'h-64', bodyClassName }) {
  return (
    <div className={cx('card-surface flex flex-col overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className={cx('flex-1', bodyClassName)}>
        {loading ? (
          <div className={cx('animate-pulse rounded-md bg-surface3', skeleton)} />
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export function ChartLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.label}
          {item.value != null && <span className="font-semibold text-ink text-tabular">{item.value}</span>}
        </span>
      ))}
    </div>
  )
}