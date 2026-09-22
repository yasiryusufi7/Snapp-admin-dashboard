export function ChartTooltip({ active, payload, label, formatter, labelFormatter, suffix }) {
  if (!active || !payload?.length) return null
  const formatValue = (v) => (formatter ? formatter(v) : `${v}${suffix || ''}`)
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-panel">
      <p className="mb-1 text-xs font-semibold text-ink">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="text-ink-soft">{entry.name}</span>
            <span className="ml-auto pl-3 font-semibold text-ink text-tabular">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}