import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cx } from '../../utils/classNames'

export const Input = forwardRef(function Input({ className, size = 'md', error, leftIcon: LeftIcon, ...props }, ref) {
  return (
    <div className={cx('relative w-full', className)}>
      {LeftIcon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-faint">
          <LeftIcon className="h-4 w-4" />
        </span>
      )}
      <input
        ref={ref}
        className={cx(
          'focus-ring w-full rounded-lg border border-line bg-surface text-sm text-ink placeholder:text-ink-faint transition-colors',
          'hover:border-line-strong',
          LeftIcon ? 'pl-9' : 'pl-3',
          size === 'sm' ? 'h-8 pr-3 text-[13px]' : 'h-9.5 pr-3',
          error && 'border-red-500/70',
          props.disabled && 'cursor-not-allowed bg-surface2 opacity-70',
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export function SearchInput({ value, onChange, placeholder = 'Search…', autoFocus, onKeyDown, className }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        value={value ?? ''}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className="focus-ring h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx(
        'focus-ring block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong',
        className,
      )}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, children, size = 'md', ...props }, ref) {
  return (
    <div className={cx('relative', className)}>
      <select
        ref={ref}
        className={cx(
          'focus-ring w-full appearance-none rounded-lg border border-line bg-surface text-sm text-ink transition-colors hover:border-line-strong focus:border-brand-500',
          size === 'sm' ? 'h-8 pl-2.5 pr-8 text-[13px]' : 'h-9.5 pl-3 pr-8',
          props.disabled && 'cursor-not-allowed bg-surface2 opacity-70',
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
})

export function Field({ label, hint, error, htmlFor, children, required, className }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-ink">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}