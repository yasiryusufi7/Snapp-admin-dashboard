import { cx } from '../../utils/classNames'
import { TrendChip, MiniSparkline } from './MiniChart'

/**
 * Density-optimized KPI unit. Variants:
 *  - default   : compact tile
 *  - rail      : full-bleed accent rail on the left
 *  - spark     : shows a mini trend line underneath
 */
export function StatCard({
  label,
  value,
  trend,
  context,
  spark,
  sparkColor = '#1aa28f',
  icon: Icon,
  tone = 'brand',
  variant = 'default',
  className,
  onClick,
  footer,
}) {
  const railColor = {
    brand: 'bg-brand-600',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
  }[tone]

  return (
    <div
      onClick={onClick}
      className={cx(
        'card-surface group relative flex flex-col gap-2 p-4 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-lift',
        className,
      )}
    >
      {variant === 'rail' && <div className={cx('absolute inset-y-0 left-0 w-[3px] rounded-l-xl', railColor)} />}

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </span>
        {trend && <TrendChip value={trend} />}
      </div>

      <div className={cx('flex items-end justify-between gap-2', variant === 'spark' && 'pr-1')}>
        <span className={cx('font-bold tracking-tight text-ink text-tabular', variant === 'spark' ? 'text-[26px] leading-none' : 'text-2xl leading-none')}>
          {value}
        </span>
        {variant === 'spark' && spark?.length > 0 && (
          <div className="mb-0.5 h-9 w-24 shrink-0 opacity-80">
            <MiniSparkline data={spark} color={sparkColor} height={36} />
          </div>
        )}
      </div>

      {context && <p className="text-xs text-ink-faint">{context}</p>}
      {footer && <div className="mt-auto">{footer}</div>}
    </div>
  )
}