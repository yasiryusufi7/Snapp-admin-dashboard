import { useRef, useState } from 'react'
import { ArrowRight, Bell, CheckCheck, Zap } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { db } from '../../data/db'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useToast } from '../../context/ToastContext'
import { LiveIndicator } from '../operations/LiveIndicator'
import { timeAgo } from '../../utils/format'

const ALERT_ICON = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  warning: 'bg-blue-500',
  info: 'bg-brand-500',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [readAll, setReadAll] = useState(false)
  const ref = useRef(null)
  const { toast } = useToast()
  useClickOutside(ref, () => setOpen(false), open)

  const alerts = db.alerts
  const unread = 6

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition hover:bg-surface3 hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {!readAll && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-panel animate-scale-in">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">Notifications</span>
              <LiveIndicator label="Live" />
            </div>
            <button
              onClick={() => {
                setReadAll(true)
                toast({ title: 'Notifications cleared', tone: 'success' })
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition hover:text-ink"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto scroll-thin">
            <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Operational alerts</p>
            {alerts.map((a) => (
              <button key={a.id} className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-surface2">
                <span className={cx('mt-1 h-2 w-2 shrink-0 rounded-full', ALERT_ICON[a.level])} />
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-ink">{a.title}</span>
                    <span className="shrink-0 text-[10.5px] text-ink-faint">{timeAgo(a.ts)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-soft">{a.detail}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-surface2/60 px-4 py-2.5">
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-200">
              View notification history <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-faint">
              <Zap className="h-3 w-3 text-amber-500" /> Dispatch feed
            </span>
          </div>
        </div>
      )}
    </div>
  )
}