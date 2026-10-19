import { cx } from '../../utils/classNames'

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('card-surface overflow-hidden', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions, icon: Icon, className }) {
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface/70 px-5 py-4', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-1 text-[13px] leading-5 text-ink-soft">{description}</p>}
        </div>
      </div>
      {actions && <div className="ml-auto flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cx(className)} {...props}>
      {children}
    </div>
  )
}
