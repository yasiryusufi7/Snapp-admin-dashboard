import { cx } from '../../utils/classNames'

export function LiveIndicator({ label = 'Live', tone = 'green', className, pulsing = true }) {
  const colors = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    brand: 'bg-brand-500',
  }
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider', className)}>
      <span className="relative flex h-2 w-2">
        {pulsing && <span className={cx('absolute inline-flex h-full w-full rounded-full animate-ping-slow', colors[tone])} />}
        <span className={cx('relative inline-flex h-2 w-2 rounded-full', colors[tone])} />
      </span>
      {label}
    </span>
  )
}