import { cx } from '../../utils/classNames'

export function Checkbox({ checked, onChange, indeterminate, label, disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label || 'Select row'}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx('focus-ring shrink-0 rounded', disabled && 'cursor-not-allowed opacity-50')}
    >
      <span
        className={cx(
          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
          checked || indeterminate ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface hover:border-brand-500',
        )}
      >
        {indeterminate && <span className="h-0.5 w-2 rounded bg-white" />}
        {checked && !indeterminate && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
    </button>
  )
}