import { cx } from '../../utils/classNames'

export function Switch({ checked, onChange, label, disabled, size = 'md' }) {
  const dims = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const knob = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2',
        checked ? 'bg-brand-600' : 'bg-line-strong',
        disabled && 'cursor-not-allowed opacity-50',
        dims,
      )}
    >
      <span
        className={cx(
          'inline-block transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0.5',
          knob,
        )}
      />
    </button>
  )
}