import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../../utils/classNames'

const DAY = 86400000

function iso(d) {
  return d.toISOString().slice(0, 10)
}

export function DateRangePicker({ value, onChange, className, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [anchor, setAnchor] = useState(new Date())

  const presets = [
    { label: 'Today', from: iso(new Date()), to: iso(new Date()) },
    { label: 'Yesterday', from: iso(new Date(Date.now() - DAY)), to: iso(new Date(Date.now() - DAY)) },
    { label: 'Last 7 days', from: iso(new Date(Date.now() - 6 * DAY)), to: iso(new Date()) },
    { label: 'Last 14 days', from: iso(new Date(Date.now() - 13 * DAY)), to: iso(new Date()) },
    { label: 'Last 30 days', from: iso(new Date(Date.now() - 29 * DAY)), to: iso(new Date()) },
  ]

  const monthLabel = anchor.toLocaleString('en-AF', { month: 'long', year: 'numeric' })
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const startDow = first.getDay()
  const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()

  const toggleDay = (d) => {
    if (!draft.from || draft.to) {
      setDraft({ from: d, to: null })
    } else {
      if (d < draft.from) setDraft({ from: d, to: draft.from })
      else setDraft({ from: draft.from, to: d })
    }
  }

  const apply = () => {
    onChange(draft)
    setOpen(false)
  }

  return (
    <div className={cx('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
      >
        <CalendarDays className="h-4 w-4 text-ink-faint" />
        {value.from === value.to ? 'Today' : `${value.from} → ${value.to}`}
      </button>
      {open && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={cx(
            'absolute z-50 mt-1.5 w-[19rem] rounded-lg border border-line bg-surface p-3 shadow-panel animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          <div className="mb-2 grid grid-cols-2 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setDraft({ from: p.from, to: p.to })
                  onChange({ from: p.from, to: p.to })
                  setOpen(false)
                }}
                className="rounded-md px-2 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface2 hover:text-ink"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mb-2 flex items-center justify-between border-y border-line py-2">
            <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))} className="rounded p-1 text-ink-soft hover:bg-surface2" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-ink">{monthLabel}</span>
            <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))} className="rounded p-1 text-ink-soft hover:bg-surface2" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="py-1 font-semibold text-ink-faint">{d}</span>
            ))}
            {Array.from({ length: (startDow + 6) % 7 }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const ds = iso(new Date(anchor.getFullYear(), anchor.getMonth(), day))
              const inRange = draft.from && draft.to && ds >= draft.from && ds <= draft.to
              const isStart = draft.from === ds
              const isEnd = draft.to === ds
              return (
                <button
                  key={ds}
                  onClick={() => toggleDay(ds)}
                  className={cx(
                    'relative mx-auto flex h-7 w-7 items-center justify-center rounded-md text-xs transition',
                    inRange ? 'bg-brand-500/15 text-brand-700 dark:text-brand-200' : 'hover:bg-surface2',
                    (isStart || isEnd) && 'bg-brand-600 font-bold text-white',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="mt-2.5 flex justify-end gap-2 border-t border-line pt-2.5">
            <button onClick={() => setOpen(false)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface2">Cancel</button>
            <button onClick={apply} className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Apply</button>
          </div>
        </div>
      )}
    </div>
  )
}