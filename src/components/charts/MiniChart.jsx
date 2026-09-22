import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { cx } from '../../utils/classNames'

export function MiniSparkline({ data = [], dataKey = 'value', color = '#1aa28f', height = 36, id }) {
  const autoId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const gid = id || `spark-${autoId}`
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.8} fill={`url(#${gid})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TrendChip({ value, className, positiveIsGood = true }) {
  if (!value || value.direction === 'flat') {
    return <span className={cx('text-xs font-medium text-ink-faint', className)}>0% vs prev</span>
  }
  const up = value.direction === 'up'
  const good = up === positiveIsGood
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-tabular',
        good ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-red-500/10 text-red-600 dark:text-red-300',
        className,
      )}
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {up ? <path d="m7 17 10-10M9 7h8v8" /> : <path d="m7 7 10 10M17 9v8H9" />}
      </svg>
      {value.label}
    </span>
  )
}