import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react'
import { cx } from '../utils/classNames'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, ring: 'border-emerald-500/30', iconColor: 'text-emerald-500' },
  error: { icon: XCircle, ring: 'border-red-500/30', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, ring: 'border-amber-500/30', iconColor: 'text-amber-500' },
  info: { icon: Info, ring: 'border-blue-500/30', iconColor: 'text-blue-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, tone = 'info', duration = 4200 }) => {
      const id = ++counter.current
      setToasts((t) => [...t.slice(-3), { id, title, description, tone }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => {
          const tone = TONES[t.tone]
          const Icon = tone.icon
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-panel animate-slide-in-right"
            >
              <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', tone.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-0.5 text-ink-faint transition hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}