import { cx } from '../../utils/classNames'

export function Divider({ className }) {
  return <div role="separator" className={cx('h-px w-full bg-line', className)} />
}

export function ProgressBar({ value = 0, tone = 'brand', className }) {
  const colors = {
    brand: 'bg-brand-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface3', className)}>
      <div
        className={cx('h-full rounded-full transition-all duration-500', colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}