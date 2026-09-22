import { cx } from '../../utils/classNames'
import { initials } from '../../utils/format'

const PALETTE = [
  'bg-brand-500/15 text-brand-700 dark:text-brand-200',
  'bg-blue-500/15 text-blue-700 dark:text-blue-200',
  'bg-violet-500/15 text-violet-700 dark:text-violet-200',
  'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
]

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({ name, size = 'md', status, className, ring }) {
  const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-[13px]', lg: 'h-11 w-11 text-sm', xl: 'h-14 w-14 text-base' }
  const color = PALETTE[hash(name) % PALETTE.length]
  return (
    <div className={cx('relative shrink-0', className)}>
      <div
        className={cx('flex items-center justify-center rounded-full font-semibold', sizes[size], color, ring && 'ring-2 ring-surface')}
        aria-hidden="true"
      >
        {initials(name)}
      </div>
      {status && (
        <span
          className={cx(
            'absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-surface',
            { 'bg-emerald-500': status === 'online', 'bg-blue-500': status === 'busy', 'bg-amber-500': status === 'break', 'bg-slate-400': status === 'offline', 'bg-red-500': status === 'suspended' },
          )}
        />
      )}
    </div>
  )
}