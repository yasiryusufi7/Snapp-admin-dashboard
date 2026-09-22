import { cx } from '../../utils/classNames'
import { fmtDateTime } from '../../utils/format'

const TONE_DOT = {
  done: 'bg-brand-600',
  current: 'bg-blue-500',
  cancelled: 'bg-red-500',
  muted: 'bg-slate-400',
}

export function ActivityTimeline({ items = [], className }) {
  return (
    <ol className={className}>
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" />}
          <span className={cx('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-surface', TONE_DOT[item.state || 'done'])} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink">{item.label}</p>
            {item.meta && <p className="mt-0.5 text-xs text-ink-soft">{item.meta}</p>}
            {item.ts && <p className="mt-0.5 text-[11px] text-ink-faint text-tabular">{fmtDateTime(item.ts)}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}