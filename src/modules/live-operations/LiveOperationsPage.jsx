import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CarFront,
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  Navigation,
  Radio,
  Route,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import { cx } from '../../utils/classNames'
import { db } from '../../data/db'
import { CITIES } from '../../data/cities'
import { STATUS } from '../../utils/constants'
import { fmtCurrency, fmtNumber, fmtDuration, timeAgo } from '../../utils/format'
import { MapPanel } from '../../components/operations/MapPanel'
import { LiveIndicator } from '../../components/operations/LiveIndicator'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { usePageGuard } from '../../components/common/PageGuard'
import { useNow } from '../../hooks/useNow'

const ACTIVE = ['in_progress', 'arriving', 'arrived', 'accepted']
const DRIVER_COLOR = { available: '#10b981', busy: '#3b82f6', break: '#f59e0b', offline: '#64748b' }

export default function LiveOperationsPage() {
  const guard = usePageGuard('liveOps')
  if (guard) return guard

  const [cityId, setCityId] = useState('kbl')
  const [tab, setTab] = useState('active')
  const [selectedDrv, setSelectedDrv] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const now = useNow(3000)

  const city = CITIES.find((c) => c.id === cityId)

  const drivers = useMemo(() => db.drivers.filter((d) => d.cityId === cityId && d.status !== 'offline' && d.status !== 'suspended').slice(0, 60), [cityId])

  const activeTrips = useMemo(
    () => db.trips.filter((t) => ACTIVE.includes(t.status) && t.cityId === cityId).sort((a, b) => a.requestedAt - b.requestedAt),
    [cityId, now],
  )

  const requests = useMemo(() => db.live.requests.filter((r) => r.cityId === cityId).slice(0, 12), [cityId, now])

  const pickupPoints = useMemo(
    () =>
      requests.map((r, i) => {
        const zone = city.areas.find((a) => a.name === r.pickupArea.name) || city.areas[i % city.areas.length]
        return {
          id: r.id,
          areaId: zone.id,
          x: Math.min(990, Math.max(10, zone.x + ((i % 5) - 2) * 22 + (now % 4000) * 0)),
          y: zone.y + ((i % 3) - 1) * 18,
          onClick: () => setTab('requests'),
        }
      }),
    [requests, city, now],
  )

  const destinations = useMemo(
    () =>
      activeTrips.map((t) => {
        const destArea = city.areas.find((a) => a.name === t.destination.split('·')[1]?.trim()) || city.areas[0]
        return { id: `${t.id}-dst`, x: destArea.x + Math.round(t.distanceKm) % 60, y: destArea.y + 20 }
      }),
    [activeTrips, city],
  )

  const routes = useMemo(
    () =>
      activeTrips.slice(0, 18).map((t) => {
        const drv = db.byDriver[t.driverId]
        const destArea = city.areas.find((a) => a.name === t.destination.split('·')[1]?.trim()) || city.areas[0]
        const sx = drv?.location?.x ?? t.pickupPoint?.x ?? city.areas[0].x
        const sy = drv?.location?.y ?? t.pickupPoint?.y ?? city.areas[0].y
        return {
          id: t.id,
          x1: sx,
          y1: sy,
          x2: destArea.x + (t.id.charCodeAt(4) % 40),
          y2: destArea.y + 24,
          hot: t.status === 'arriving',
        }
      }),
    [activeTrips, city],
  )

  const hotspots = useMemo(() => db.hotspots.filter((h, i) => (cityId === 'kbl' ? true : i % 2 === 0)), [cityId])

  const metrics = [
    { label: 'Active trips', value: fmtNumber(db.kpis.activeTrips), live: true, tone: 'text-brand-300' },
    { label: 'Online drivers', value: fmtNumber(db.kpis.onlineDrivers), tone: 'text-white' },
    { label: 'Available', value: fmtNumber(db.kpis.availableDrivers), tone: 'text-emerald-300' },
    { label: 'Busy', value: fmtNumber(db.kpis.busyDrivers), tone: 'text-blue-300' },
    { label: 'Pending requests', value: fmtNumber(db.kpis.pendingRequests), tone: 'text-amber-300' },
  ]

  const selectTrip = (t) => {
    setSelectedTrip(t?.id ?? null)
    setSelectedDrv(t?.driverId ?? null)
    if (!t) return
    const row = document.getElementById(`trip-row-${t.id}`)
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  let requestEta = 0

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[640px] flex-col gap-3">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-ink">Live Operations</h1>
              <LiveIndicator label="Live" />
            </div>
            <p className="text-xs text-ink-soft text-tabular">
              {city.name} · Sector 01 · snapshot {new Date(now).toLocaleTimeString('en-AF', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={cityId}
            onChange={setCityId}
            size="sm"
            options={CITIES.map((c) => ({ value: c.id, label: c.name.split(' ')[0] }))}
          />
          <Link to="/trips" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink-soft hover:border-line-strong">
            <Route className="h-3.5 w-3.5" /> All trips
          </Link>
        </div>
      </div>

      {/* ============ COMMAND CENTER ============ */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[248px_minmax(0,1fr)_300px]">
        {/* LEFT — operations panel */}
        <aside className="flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900 text-white">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
            <Radio className="h-4 w-4 text-brand-300" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Operations</span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/6">
            {metrics.map((m) => (
              <div key={m.label} className="bg-navy-900 px-3.5 py-3">
                <p className="flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-wide text-slate-500">
                  {m.live && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-400" />}
                  {m.label}
                </p>
                <p className={cx('mt-0.5 font-mono text-xl font-bold tracking-tight text-tabular', m.tone)}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Demand hotspots */}
          <div className="mt-3 flex-1 overflow-y-auto px-3.5 pb-3 scroll-thin">
            <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="h-3 w-3" /> Demand hotspots
            </p>
            <ul className="space-y-1.5">
              {hotspots.map((h) => (
                <li key={h.id} className="rounded-lg bg-white/4 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">{h.name}</span>
                    <div className="flex items-center gap-1.5">
                      {h.surge && <Badge tone="amber">{h.surge.toFixed(1)}×</Badge>}
                      <Badge tone={h.intensity > 80 ? 'red' : h.intensity > 60 ? 'amber' : 'slate'}>
                        {h.pending} req
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                    <div className={cx('h-full rounded-full', h.intensity > 80 ? 'bg-red-500' : h.intensity > 60 ? 'bg-amber-400' : 'bg-slate-500')} style={{ width: `${h.intensity}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom supply alarm */}
          <div className="border-t border-white/8 px-3.5 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-amber-300">Low supply risk</span>
              <span className="text-slate-500 text-tabular">{city.areas.length} zones</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">2 zones below 60% coverage. Dispatch nudges sent automatically.</p>
          </div>
        </aside>

        {/* CENTER — map */}
        <section className="relative min-w-0 overflow-hidden rounded-xl border border-navy-800 bg-navy-950">
          <MapPanel
            zones={city.areas.map((a) => ({ ...a, zone: a.zone || 'Central' }))}
            drivers={drivers.map((d) => ({ id: d.id, name: d.name, x: d.location.x, y: d.location.y, color: DRIVER_COLOR[d.status], status: d.status }))}
            routes={routes}
            pickups={pickupPoints}
            destinations={destinations}
            hotspots={hotspots}
            scheme="dark"
            selectedDriverId={selectedDrv}
            onDriverSelect={(d) => setSelectedDrv(d.id)}
            onZoneHover={undefined}
            height="100%"
          />

          {/* map overlay: selection card */}
          {selectedDrv && (
            <div className="absolute left-3 top-3 w-64 rounded-xl border border-white/10 bg-navy-900/95 p-3 text-white shadow-panel backdrop-blur animate-slide-in-up">
              <SelCard driverId={selectedDrv} onClose={() => setSelectedDrv(null)} onFocusTrip={(id) => selectTrip({ id, driverId: selectedDrv })} />
            </div>
          )}

          {/* map overlay: live clock chip */}
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg border border-white/10 bg-navy-900/90 px-2.5 py-1.5 text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[11px] text-tabular">{new Date(now).toLocaleTimeString('en-AF')}</span>
          </div>
        </section>

        {/* RIGHT — trip queue */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900 text-white">
          <div className="flex items-center gap-1 border-b border-white/8 px-2 py-2">
            {[
              { key: 'active', label: 'Active', count: activeTrips.length },
              { key: 'requests', label: 'Requests', count: requests.length },
              { key: 'alerts', label: 'Alerts', count: db.alerts.length },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cx(
                  'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition',
                  tab === t.key ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {t.label}
                <span className="rounded-full bg-white/8 px-1.5 text-[10px] text-tabular">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin">
            {tab === 'active' && (
              <ul className="divide-y divide-white/6">
                {activeTrips.length === 0 && <EmptyQueue label="No active trips in this sector" />}
                {activeTrips.map((t, i) => {
                  const progress = (i * 37 + Math.floor(now / 4000) * 13) % 92 + 8
                  const selected = selectedTrip === t.id
                  return (
                    <li
                      key={t.id}
                      id={`trip-row-${t.id}`}
                      onClick={() => selectTrip(t)}
                      className={cx('cursor-pointer px-3.5 py-2.5 transition-colors', selected ? 'bg-brand-500/12' : 'hover:bg-white/4')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-brand-300">{t.id}</span>
                        <StatusBadge status={STATUS.trip[t.status]} size="sm" />
                      </div>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-100">
                        <Navigation className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{t.pickup.split('·')[1]?.trim() || t.pickup}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 pl-5 text-[13px] text-slate-300">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{t.destination.split('·')[1]?.trim() || t.destination}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                        <span className="flex items-center gap-1"><CarFront className="h-3 w-3" />{t.driver.split(' ')[0]} · {t.vehiclePlate}</span>
                        <span className="text-tabular">{fmtCurrency(t.fare, { compact: true })}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-brand-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 text-tabular">{progress}%</span>
                        <span className="text-[10px] text-slate-600 text-tabular">{t.durationMin}m</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {tab === 'requests' && (
              <ul className="divide-y divide-white/6">
                {requests.map((r) => {
                  requestEta += 1
                  return (
                    <li key={r.id} className="px-3.5 py-3">
                      <div className="flex items-start gap-2.5">
                        <Avatar name={r.passenger} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-medium text-slate-100">{r.passenger}</p>
                            <span className="text-[10.5px] text-amber-300 text-tabular">waiting {r.ageSec}s</span>
                          </div>
                          <p className="mt-0.5 truncate text-[11.5px] text-slate-400">{r.pickup}</p>
                          <p className="truncate text-[11.5px] text-slate-500">→ {r.destination} · {r.distanceKm} km · ~{r.estFare} AFN</p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <button className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-brand-500 text-[11.5px] font-bold text-white transition hover:bg-brand-400">
                          <Check className="h-3.5 w-3.5" /> Dispatch
                        </button>
                        <button className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-white/8 text-[11.5px] font-bold text-slate-200 transition hover:bg-white/12">
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {tab === 'alerts' && (
              <ul className="divide-y divide-white/6">
                {db.alerts.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 px-3.5 py-3">
                    <CircleAlert className={cx('mt-0.5 h-4 w-4 shrink-0', { 'text-red-400': a.level === 'critical', 'text-amber-300': a.level === 'high', 'text-blue-300': a.level === 'warning', 'text-brand-300': a.level === 'info' })} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-slate-100">{a.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-slate-400">{a.detail}</p>
                      <p className="mt-1 text-[10.5px] text-slate-500 text-tabular">{timeAgo(a.ts)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* ============ TELEMETRY STRIP ============ */}
      <footer className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-navy-800 bg-navy-900 px-5 py-2.5 text-white md:grid-cols-4">
        <Telemetry icon={Zap} label="Demand index" value="1.34×" sub="vs 7-day average · rising" tone="text-amber-300" />
        <Telemetry icon={CarFront} label="Supply index" value="0.92×" sub="3,821 online · 4 city coverage" tone="text-blue-300" />
        <Telemetry icon={Clock3} label="Avg pickup" value="6.4 min" sub="target 7.0 · on track" tone="text-emerald-300" />
        <Telemetry icon={CircleAlert} label="Cancellations" value="8.2%" sub="+0.6pp vs yesterday · monitor" tone="text-red-300" />
      </footer>
    </div>
  )
}

function EmptyQueue({ label }) {
  return (
    <div className="px-6 py-12 text-center">
      <UsersRound className="mx-auto h-6 w-6 text-slate-700" />
      <p className="mt-2 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function Telemetry({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className={cx('font-mono text-sm font-bold text-tabular', tone)}>{value}</p>
        <p className="truncate text-[10px] text-slate-500">{sub}</p>
      </div>
    </div>
  )
}

function SelCard({ driverId, onClose, onFocusTrip }) {
  const d = db.byDriver[driverId]
  if (!d) return null
  const activeTrip = db.trips.find((t) => t.driverId === driverId && ACTIVE.includes(t.status))
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Avatar name={d.name} size="sm" status={d.status === 'busy' ? 'busy' : 'online'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{d.name}</p>
          <p className="text-[11px] text-slate-400">{d.plate} · {d.vehicle.brand}</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/8 text-center text-[11px]">
        <div className="bg-navy-900 py-1.5"><p className="text-slate-500">Rating</p><p className="font-bold text-white text-tabular">{d.rating.toFixed(1)}</p></div>
        <div className="bg-navy-900 py-1.5"><p className="text-slate-500">Trips</p><p className="font-bold text-white text-tabular">{fmtNumber(d.rides, { compact: true })}</p></div>
        <div className="bg-navy-900 py-1.5"><p className="text-slate-500">Accept</p><p className="font-bold text-white text-tabular">{d.acceptanceRate}%</p></div>
      </div>
      {activeTrip && (
        <button onClick={() => onFocusTrip(activeTrip.id)} className="mt-2.5 flex w-full items-center justify-between rounded-lg bg-white/6 px-3 py-2 text-left text-xs transition hover:bg-white/10">
          <span className="text-slate-300">Current trip <span className="font-mono font-bold text-brand-300">{activeTrip.id}</span></span>
          <Navigation className="h-3.5 w-3.5 text-brand-300" />
        </button>
      )}
    </div>
  )
}