import { useState } from 'react'
import { cx } from '../../utils/classNames'

export function Tooltip({ label, children, side = 'top' }) {
  const [open, setOpen] = useState(false)
  const positions = {
    top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
    right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
    bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  }
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cx(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white shadow-panel dark:bg-surface3 dark:text-ink dark:ring-1 dark:ring-line',
            positions[side],
          )}
        >
          {label}
        </span>
      )}
    </span>
  )
}