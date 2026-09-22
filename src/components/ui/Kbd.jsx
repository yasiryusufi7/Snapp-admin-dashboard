export function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface2 px-1 font-mono text-[10px] font-medium text-ink-soft">
      {children}
    </kbd>
  )
}