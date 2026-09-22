import { cx } from '../../utils/classNames'
import { TONES } from '../../utils/constants'

/** Generic status pill driven by the STATUS token system. */
export function StatusBadge({ status, tone, label, dot = true, className, size = 'md' }) {
  const resolved = tone ? TONES[tone] : TONES[status.tone]
  const text = label || status.label
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
        resolved.badge,
        className,
      )}
    >
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full shrink-0', resolved.dot)} />}
      {text}
    </span>
  )
}

export function Badge({ children, tone = 'slate', className, dot }) {
  const resolved = TONES[tone]
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold', resolved.badge, className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', resolved.dot)} />}
      {children}
    </span>
  )
}