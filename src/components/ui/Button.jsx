import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from '../../utils/classNames'

const VARIANTS = {
  primary:
    'bg-brand-700 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-800 disabled:hover:bg-brand-700 dark:bg-brand-300 dark:text-navy-950 dark:hover:bg-brand-200 dark:disabled:hover:bg-brand-300',
  navy: 'bg-navy-800 text-white shadow-sm hover:bg-navy-900 disabled:hover:bg-navy-800 dark:bg-navy-700 dark:hover:bg-navy-800',
  secondary:
    'bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface2 disabled:hover:bg-surface',
  ghost: 'text-ink-soft hover:bg-surface3 hover:text-ink disabled:hover:bg-transparent disabled:hover:text-ink-soft',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:hover:bg-red-600',
  'danger-ghost': 'text-red-600 hover:bg-red-500/10 disabled:hover:bg-transparent disabled:hover:text-red-600',
  subtle: 'bg-surface2 text-ink-soft border border-line hover:text-ink hover:border-line-strong disabled:hover:text-ink-soft',
}

const SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9.5 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        'focus-ring inline-flex select-none items-center justify-center rounded-lg font-semibold transition-all duration-150 active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className={cx('h-4 w-4 animate-spin')} /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  )
})

export function IconButton({ label, icon: Icon, onClick, variant = 'ghost', size = 'md', className, active, ...props }) {
  const sizes = { sm: 'h-7.5 w-7.5', md: 'h-9 w-9', lg: 'h-10 w-10' }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'focus-ring inline-flex items-center justify-center rounded-lg transition-colors duration-150',
        variant === 'ghost' && 'text-ink-faint hover:bg-surface3 hover:text-ink',
        variant === 'solid' && 'bg-surface text-ink border border-line hover:border-line-strong shadow-sm',
        active && 'bg-surface3 text-ink',
        sizes[size],
        className,
      )}
      {...props}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  )
}
