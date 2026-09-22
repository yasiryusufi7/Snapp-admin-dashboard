import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, UsersRound, CarFront, Route, Car, CalendarCheck2 } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { db } from '../../data/db'
import { Kbd } from '../ui/Kbd'
import { Avatar } from '../ui/Avatar'

const GROUPS = [
  {
    key: 'passengers',
    label: 'Passengers',
    icon: UsersRound,
    rows: db.passengers.map((p) => ({
      id: p.id,
      title: p.name,
      sub: `${p.phone} · ${p.city}`,
      avatar: p.name,
      to: `/passengers?q=${p.id}`,
      match: [p.name, p.phone, p.email, p.id],
    })),
  },
  {
    key: 'drivers',
    label: 'Drivers',
    icon: CarFront,
    rows: db.drivers.map((d) => ({
      id: d.id,
      title: d.name,
      sub: `${d.plate} · ${d.city}`,
      avatar: d.name,
      avatarStatus: d.status === 'available' ? 'online' : d.status === 'busy' ? 'busy' : 'offline',
      to: `/drivers?q=${d.id}`,
      match: [d.name, d.phone, d.id, d.plate, d.city],
    })),
  },
  {
    key: 'trips',
    label: 'Trips',
    icon: Route,
    rows: db.trips.slice(0, 400).map((t) => ({
      id: t.id,
      title: t.id,
      sub: `${t.passenger} → ${t.destination} · ${t.city}`,
      to: `/trips/${t.id}`,
      match: [t.id, t.passenger, t.driver, t.plate, t.city],
    })),
  },
  {
    key: 'vehicles',
    label: 'Vehicles',
    icon: Car,
    rows: db.vehicles.map((v) => ({
      id: v.id,
      title: v.plate,
      sub: `${v.brand} · ${v.type}`,
      to: `/vehicles?q=${v.plate}`,
      match: [v.plate, v.brand, v.id],
    })),
  },
  {
    key: 'bookings',
    label: 'Bookings',
    icon: CalendarCheck2,
    rows: db.bookings.map((b) => ({
      id: b.id,
      title: b.id,
      sub: `${b.passenger} · ${b.pickup}`,
      to: `/bookings?q=${b.id}`,
      match: [b.id, b.passenger, b.pickup, b.destination],
    })),
  },
]

export function GlobalSearch({ open, onClose, triggerRef }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const flat = []
    for (const g of GROUPS) {
      const hits = g.rows
        .filter((r) => r.match.some((m) => String(m).toLowerCase().includes(q)))
        .slice(0, 5)
      if (hits.length) flat.push({ group: g, hits })
    }
    return flat
  }, [query])

  const flatCount = results.reduce((s, g) => s + g.hits.length, 0)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const leave = (entries, index) => {
    onClose()
    navigate(entries.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(flatCount - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      let n = active
      for (const g of results) {
        if (n < g.hits.length) {
          leave(g.hits[n])
          return
        }
        n -= g.hits.length
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[75]" onKeyDown={onKeyDown}>
      <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={triggerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="mx-auto mt-[12vh] w-[34rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-panel animate-scale-in"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="h-5 w-5 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search passengers, drivers, trips, vehicles, bookings…"
            aria-label="Search the platform"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2 scroll-thin">
          {!query && (
            <div className="px-4 py-8 text-center">
              <SearchStep />
            </div>
          )}
          {query && flatCount === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-ink-soft">No results for “{query}”</p>
              <p className="mt-1 text-xs text-ink-faint">Try a passenger name, driver ID or trip number.</p>
            </div>
          )}
          {results.map(({ group, hits }) => {
            const GroupIcon = group.icon
            return (
              <div key={group.key}>
                <div className="flex items-center gap-1.5 px-4 py-1.5">
                  <GroupIcon className="h-3.5 w-3.5 text-ink-faint" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{group.label}</span>
                </div>
                {hits.map((r) => {
                  const index = (() => {
                    let n = 0
                    for (const g of results) {
                      if (g === group) return n + hits.indexOf(r)
                      n += g.hits.length
                    }
                    return 0
                  })()
                  const isActive = index === active
                  return (
                    <button
                      key={r.id}
                      data-active={isActive}
                      onClick={() => leave(r, index)}
                      onMouseMove={() => setActive(index)}
                      className={cx(
                        'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                        isActive ? 'bg-brand-500/10' : '',
                      )}
                    >
                      <Avatar name={r.avatar || r.title} size="sm" status={r.avatarStatus} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">{r.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{r.sub}</span>
                      </span>
                      <CornerDownLeft className="h-3.5 w-3.5 text-ink-faint" />
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-ink-faint">
          <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="ml-auto">Ctrl K to reopen</span>
        </div>
      </div>
    </div>
  )
}

function SearchStep() {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-medium text-ink-soft">Search across the whole platform</p>
      <p className="text-xs text-ink-faint">Drivers, riders, vehicles, trips and scheduled bookings.</p>
    </div>
  )
}