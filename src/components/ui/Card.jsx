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
    <div className={cx('flex items-start justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface3 text-ink-soft">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
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