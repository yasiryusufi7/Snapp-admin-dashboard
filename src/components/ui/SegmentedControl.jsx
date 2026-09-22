import { cx } from '../../utils/classNames'

export function SegmentedControl({ options, value, onChange, size = 'md', className }) {
  return (
    <div role="tablist" className={cx('inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface2 p-0.5', className)}>
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cx(
              'rounded-md font-medium transition-colors duration-150 whitespace-nowrap',
              size === 'md' ? 'px-3 py-1.5 text-[13px]' : 'px-2.5 py-1 text-xs',
              isActive
                ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                : 'text-ink-faint hover:text-ink-soft',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}