import { Star, StarHalf } from 'lucide-react'
import { cx } from '../../utils/classNames'

export function Rating({ value, size = 14, showValue = false, className }) {
  const full = Math.floor(value || 0)
  const hasHalf = (value || 0) - full >= 0.25
  return (
    <span className={cx('inline-flex items-center gap-1', className)}>
      <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <Star key={i} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />
          if (i === full && hasHalf) return <StarHalf key={i} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />
          return <Star key={i} style={{ width: size, height: size }} className="text-line-strong" />
        })}
      </span>
      {showValue && <span className="font-medium text-ink-soft text-tabular">{value.toFixed(1)}</span>}
    </span>
  )
}