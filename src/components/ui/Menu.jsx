import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { useClickOutside } from '../../hooks/useClickOutside'

const MenuContext = createContext(null)

export function Menu({ trigger, children, align = 'end', width = 'w-56', label }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <MenuContext.Provider value={{ close: () => setOpen(false) }}>
      <div ref={ref} className="relative inline-block text-left">
        <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
        {open && (
          <div
            role="menu"
            aria-label={label}
            className={cx(
              'absolute z-50 mt-1.5 min-w-max origin-top rounded-lg border border-line bg-surface py-1 shadow-panel animate-scale-in',
              width,
              align === 'end' ? 'right-0' : 'left-0',
            )}
          >
            {children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  )
}

export function MenuItem({ icon: Icon, children, onClick, danger, selected, hint, disabled }) {
  const ctx = useContext(MenuContext)
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        ctx.close()
        onClick?.()
      }}
      className={cx(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        danger ? 'text-red-600 hover:bg-red-500/8' : 'text-ink-soft hover:bg-surface2 hover:text-ink',
      )}
    >
      {icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 whitespace-nowrap">{children}</span>
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      {selected && <Check className="h-4 w-4 text-brand-600" />}
    </button>
  )
}

export function MenuLabel({ children }) {
  return <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{children}</div>
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-line" />
}