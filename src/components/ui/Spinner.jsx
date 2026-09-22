import { cx } from '../../utils/classNames'

export function Spinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-8 w-8' }
  return (
    <svg className={cx('animate-spin text-brand-500', sizes[size], className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function LoadingSpinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-ink-soft" role="status">
      <Spinner />
      <span className="text-sm font-medium">{label || 'Loading…'}</span>
    </div>
  )
}