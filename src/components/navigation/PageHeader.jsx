import { cx } from '../../utils/classNames'
import { LiveIndicator } from '../operations/LiveIndicator'

export function PageHeader({ title, description, live, actions, className, children }) {
  return (
    <div className={cx('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {live && <LiveIndicator label="Live" />}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-5 text-ink-soft">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
