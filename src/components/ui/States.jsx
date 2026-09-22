import { SearchX } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = SearchX, className }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className || ''}`}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface3 text-ink-faint">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message = 'We could not load this data.', onRetry, className }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className || ''}`}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-ink">Something went wrong</p>
      <p className="mt-1 max-w-xs text-[13px] text-ink-soft">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-ink-soft transition hover:border-line-strong hover:text-ink"
        >
          Try again
        </button>
      )}
    </div>
  )
}