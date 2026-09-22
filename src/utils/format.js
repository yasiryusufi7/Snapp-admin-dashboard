const CURRENCY = 'AFN'
const LOCALE = 'en-AF'

const nf = new Intl.NumberFormat(LOCALE)
const nfCompact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const cf = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })

export function fmtNumber(value, opts = {}) {
  const n = Number(value || 0)
  if (opts.compact) return nfCompact.format(n)
  return nf.format(n)
}

export function fmtCurrency(value, opts = {}) {
  const n = Number(value || 0)
  if (opts.compact) return `${CURRENCY} ${nfCompact.format(n)}`
  return cf.format(n)
}

export function fmtPercent(value, digits = 1) {
  return `${Number(value || 0).toFixed(digits)}%`
}

/** seconds → "14:32" or "1h 12m" */
export function fmtDuration(seconds, opts = {}) {
  const s = Math.max(0, Math.round(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (opts.clock) return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

export function fmtDate(input, opts = {}) {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric', ...opts })
}

export function fmtDateTime(input, opts = {}) {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleString(LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  })
}

export function fmtTime(input) {
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function timeAgo(input) {
  const then = input instanceof Date ? input.getTime() : new Date(input).getTime()
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return fmtDate(then)
}

/** "Now", "in 3h", "tomorrow 09:00" style relative future label. */
export function hoursFromNow(input) {
  const then = new Date(input).getTime()
  const hours = (then - Date.now()) / 3600000
  if (hours <= 0) return 'Now'
  if (hours < 1) return `in ${Math.max(1, Math.round(hours * 60))}min`
  if (hours < 24) return `in ${Math.round(hours)}h`
  return fmtDateTime(then)
}

export function pctChange(current, previous) {
  if (!previous) return { value: 0, direction: 'flat', label: '' }
  const diff = current - previous
  const value = (diff / previous) * 100
  return {
    value,
    abs: Math.abs(value),
    direction: value > 0.05 ? 'up' : value < -0.05 ? 'down' : 'flat',
    label: `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}%`,
  }
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function pad(n, size = 2) {
  return String(n).padStart(size, '0')
}