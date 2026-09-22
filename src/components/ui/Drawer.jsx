import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { useClickOutside } from '../../hooks/useClickOutside'

export function Drawer({ open, onClose, title, description, children, footer, side = 'right', width = 'w-[30rem] max-w-[92vw]' }) {
  const ref = useRef(null)
  useClickOutside(ref, onClose, open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const slide = side === 'right' ? 'right-0 border-l animate-slide-in-right' : 'left-0 border-r animate-[slide-in-left_0.16s_ease-out]'

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="fixed inset-0 bg-navy-950/45 backdrop-blur-[1px] animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx('absolute inset-y-0 flex w-full flex-col bg-surface shadow-panel', slide, width)}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close panel" className="rounded-md p-1 text-ink-faint transition hover:bg-surface3 hover:text-ink">
            <X className="h-4.5 w-4.5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
      </aside>
    </div>
  )
}