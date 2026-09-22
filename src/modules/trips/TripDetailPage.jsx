import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, BadgeCheck, Clock, CreditCard, Navigation, Receipt, Route as RouteIcon, ShieldAlert, Wallet } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { tripService } from '../../services/tripService'
import { getDriver, getPassenger } from '../../data/db'
import { fmtCurrency, fmtDateTime, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { usePageGuard } from '../../components/common/PageGuard'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/States'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { LiveIndicator } from '../../components/operations/LiveIndicator'

export default function TripDetailPage() {
  const guard = usePageGuard('trips')
  if (guard) return guard

  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: trip, loading } = useAsync(() => tripService.get(id), [id])
  const { data: passenger } = useAsync(() => (trip ? getPassenger(trip.passengerId) : null), [trip])
  const { data: driver } = useAsync(() => (trip ? getDriver(trip.driverId) : null), [trip])

  if (loading) return <div className="h-40" />
  if (!trip) return <EmptyState title="Trip not found" action={<Button variant="secondary" onClick={() => navigate('/trips')}>Back to trips</Button>} />

  const live = ['accepted', 'arriving', 'arrived', 'in_progress'].includes(trip.status)

  const RATE = {
    economy: { base: 42, perKm: 17.5, perMin: 3.2 },
    executive: { base: 110, perKm: 33.5, perMin: 5.4 },
    xl: { base: 96, perKm: 25, perMin: 4.2 },
    eco: { base: 38, perKm: 19, perMin: 3.6 },
  }
  const rate = RATE[trip.vehicleType] || RATE.economy
  const subtotal = rate.base + rate.perKm * trip.distanceKm + rate.perMin * trip.durationMin
  const surge = Math.max(0, Math.round(trip.fare - subtotal))
  const commissionRate = trip.fare ? ((trip.commission / trip.fare) * 100).toFixed(1) : '—'

  const remainingMin = trip.status === 'completed' ? 0 : trip.status === 'in_progress' ? Math.max(1, Math.round(trip.durationMin * 0.45)) : trip.durationMin
  const remainingKm = trip.status === 'completed' ? 0 : trip.status === 'in_progress' ? Math.max(0.3, Number((trip.distanceKm * 0.5).toFixed(1))) : trip.distanceKm

  const pickupArea = trip.area
  const destArea = trip.destination.includes('·') ? trip.destination.split('·')[1].trim() : '—'

  const breakdown = [
    { label: 'Base fare', value: rate.base },
    { label: `Distance · ${trip.distanceKm} km × ${rate.perKm} AFN/km`, value: Math.round(rate.perKm * trip.distanceKm) },
    { label: `Time · ${trip.durationMin} min × ${rate.perMin} AFN/min`, value: Math.round(rate.perMin * trip.durationMin) },
  ]
  if (surge > 0) {
    const uplift = trip.peak && trip.night ? 'Peak + night uplift' : trip.peak ? 'Peak uplift' : trip.night ? 'Night uplift' : 'Surge'
    breakdown.push({ label: uplift, value: surge, tone: 'text-brand-600 dark:text-brand-300' })
  }

  const timeline = []
  const push = (label, ts, done = true) => ts && timeline.push({ label, ts, done })
  push('Trip requested', trip.requestedAt)
  if (trip.status === 'accepted' || trip.status === 'arriving') timeline.push({ label: 'En route to pickup', ts: trip.startedAt || trip.requestedAt, done: false })
  if (trip.status === 'arrived') timeline.push({ label: 'Driver arrived', ts: trip.startedAt || trip.requestedAt, done: false })
  push('Trip started', trip.startedAt)
  if (trip.status === 'in_progress') timeline.push({ label: 'En route to destination', ts: trip.startedAt || trip.requestedAt, done: false })
  push('Trip completed', trip.completedAt, trip.status === 'completed')
  if (trip.status === 'cancelled') timeline.push({ label: `Cancelled · ${trip.cancelReason || 'no reason given'}`, ts: trip.cancelledAt, done: false })

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface3 text-brand-700 dark:text-brand-200"><RouteIcon className="h-5 w-5" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-lg font-bold tracking-tight text-ink">{trip.id}</h1>
              <StatusBadge status={STATUS.trip[trip.status]} />
              {trip.anomaly && <Badge tone="amber"><AlertTriangle className="h-3 w-3" /> Flagged</Badge>}
            </div>
            <p className="mt-0.5 text-[13px] text-ink-soft">{trip.city} · requested {fmtDateTime(trip.requestedAt)} ({timeAgo(trip.requestedAt)})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {trip.status === 'completed' && (
            <>
              <Button variant="secondary" icon={Receipt} onClick={() => toast({ title: 'Invoice', description: `${trip.id} invoice re-sent to ${passenger?.name}.`, tone: 'info' })}>Invoice</Button>
              <Button variant="danger-ghost" onClick={() => toast({ title: 'Refund issued', description: `${fmtCurrency(trip.fare)} returned to ${passenger?.name}.`, tone: 'success' })}>Refund</Button>
            </>
          )}
          <Button variant="secondary" icon={ShieldAlert} onClick={() => toast({ title: 'Raised to trust & safety', description: `${trip.id} queued for review.`, tone: 'warning' })}>Escalate</Button>
        </div>
      </div>

      {live && (
        <div className="card-surface flex items-center gap-3 px-5 py-4">
          <LiveIndicator label="LIVE TRIP" />
          <p className="text-[13px] text-ink-soft">
            {driver?.name} is <span className="font-semibold text-ink">{trip.status.replace('_', ' ')}</span> · ETA {remainingMin} min · distance remaining {remainingKm} km
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Route map */}
        <div className="card-surface lg:col-span-2">
          <CardHeader title="Route" description={trip.status === 'completed' ? 'Completed path' : 'Active path'} />
          <CardBody>
            <RouteVisual trip={trip} live={live} />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint"><Navigation className="h-3.5 w-3.5" /> Pickup</p>
                <p className="mt-1 text-sm font-semibold text-ink">{trip.pickup}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{pickupArea}</p>
                <p className="mt-1.5 font-mono text-xs text-ink-faint text-tabular">{fmtDateTime(trip.requestedAt)}</p>
              </div>
              <div className="rounded-xl border border-line p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint"><RouteIcon className="h-3.5 w-3.5" /> Destination</p>
                <p className="mt-1 text-sm font-semibold text-ink">{trip.destination}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{destArea}</p>
                <p className="mt-1.5 font-mono text-xs text-ink-faint text-tabular">{trip.status === 'completed' ? fmtDateTime(trip.completedAt) : `ETA ~${remainingMin} min`}</p>
              </div>
            </div>
          </CardBody>
        </div>

        {/* Parties + fare */}
        <div className="flex flex-col gap-4">
          <PartyCard title="Passenger" name={passenger?.name} sub={passenger?.id} to={`/passengers/${trip.passengerId}`} meta={[
            { label: 'Rating', value: passenger?.rating?.toFixed(1) || '—' },
            { label: 'Trips', value: String(passenger?.trips || '—') },
            { label: 'Payment', value: trip.paymentMethod.toUpperCase() },
          ]} />

          <PartyCard title="Driver" name={driver?.name} sub={driver?.id} to={`/drivers/${trip.driverId}`} meta={[
            { label: 'Rating', value: driver?.rating?.toFixed(1) || '—' },
            { label: 'Vehicle', value: driver?.plate || '—' },
            { label: 'Online now', value: driver?.status === 'busy' ? 'On trip' : driver?.status === 'available' ? 'Available' : driver?.status === 'break' ? 'On break' : 'Offline' },
          ]} />

          {/* Fare breakdown */}
          <Card>
            <CardHeader title="Fare breakdown" description={`Paid ${trip.paymentMethod}`} />
            <CardBody>
              <div className="space-y-2">
                {breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-soft">{b.label}</span>
                    <span className={`font-semibold text-tabular ${b.tone || 'text-ink'}`}>{b.value > 0 ? '+' : ''}{b.value} AFN</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-[13px] font-medium text-ink">Total</span>
                  <span className="text-lg font-bold text-ink text-tabular">{trip.fare} AFN</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-2 text-xs">
                  <span className="text-ink-soft">Platform commission</span>
                  <span className="font-semibold text-ink text-tabular">{trip.commission} AFN ({commissionRate}%)</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Trip timeline */}
      <div className="card-surface p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Trip timeline</p>
        <ol className="grid grid-cols-1 gap-0 sm:grid-cols-5">
          {timeline.map((t, i) => (
            <li key={t.label} className="relative flex gap-3 pb-4 sm:block sm:pb-0">
              {i < timeline.length - 1 && <span className="absolute left-[10px] top-5 h-4 w-px bg-line sm:left-0 sm:top-2.5 sm:h-px sm:w-full sm:bg-line" />}
              <span className={`relative z-10 mt-1 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${live && i === timeline.length - 1 ? 'bg-brand-500 animate-pulse-soft' : t.done ? 'bg-brand-600' : 'bg-slate-300'}`}>
                {t.done && <BadgeCheck className="h-3 w-3 text-white" />}
              </span>
              <div className="sm:mt-2.5">
                <p className="text-[13px] font-medium text-ink">{t.label}</p>
                <p className="font-mono text-[11px] text-ink-faint text-tabular">{fmtDateTime(t.ts)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-8">
        {[
          { icon: RouteIcon, label: 'Distance', value: `${trip.distanceKm} km` },
          { icon: Clock, label: 'Duration', value: trip.durationMin ? `${trip.durationMin} min` : '—' },
          { icon: Navigation, label: 'Pricing', value: trip.peak && trip.night ? 'Peak + night' : trip.peak ? 'Peak' : trip.night ? 'Night' : 'Standard' },
          { icon: CreditCard, label: 'Method', value: trip.paymentMethod },
          { icon: Wallet, label: 'Commission', value: `${trip.commission} AFN (${commissionRate}%)` },
          { icon: BadgeCheck, label: 'Driver rated', value: driver?.rating ? `${driver.rating.toFixed(1)}★` : '—' },
          { icon: BadgeCheck, label: 'Rider rated', value: passenger?.rating ? `${passenger.rating.toFixed(1)}★` : '—' },
          { icon: RouteIcon, label: 'Vehicle', value: trip.vehicleType },
        ].map((m, i) => (
          <div key={i} className="bg-surface px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint"><m.icon className="h-3.5 w-3.5" />{m.label}</p>
            <p className="mt-1 text-sm font-bold text-ink capitalize text-tabular">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RouteVisual({ trip, live }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-line bg-[var(--map-bg)]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 28% 42%, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 14%, transparent 15%), linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '120px 120px, 24px 24px, 24px 24px',
        }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={`M 12 78 C 30 68, 38 34, 50 30 S 78 26, 88 14`} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeDasharray="2.5 2.5" />
        <path d={`M 12 78 C 30 68, 38 34, 50 30 S 78 26, 88 14`} fill="none" stroke={live ? 'var(--brand-500, #14b8a6)' : '#14b8a6'} strokeWidth="1.6" strokeLinecap="round" className={live ? 'animate-dash-flow' : ''} />
        <g>
          <circle cx="12" cy="78" r="3" fill="#818cf8" />
          <circle cx="12" cy="78" r="6" fill="rgba(129,140,248,0.3)" />
        </g>
        <g>
          <circle cx="88" cy="14" r="3" fill="#f59e0b" />
          <circle cx="88" cy="14" r="6" fill="rgba(245,158,11,0.3)" />
        </g>
        {live && (
          <g>
            <circle cx="46" cy="34" r="2.6" fill="var(--brand-500, #14b8a6)" />
            <circle cx="46" cy="34" r="6" fill="rgba(20,184,166,0.35)" className="animate-ping origin-center" style={{ transformOrigin: '46px 34px' }} />
          </g>
        )}
      </svg>
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
        {live ? <LiveIndicator label={trip.status.replace('_', ' ')} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
        <span>{trip.city}</span>
      </div>
    </div>
  )
}

function PartyCard({ title, name, sub, meta, to }) {
  return (
    <Card>
      <CardHeader title={title} description={sub} />
      <CardBody>
        <div className="flex items-center gap-3">
          <Avatar name={name} size="md" />
          <div className="min-w-0">
            {to ? (
              <Link to={to} className="text-sm font-semibold text-ink hover:text-brand-700 hover:underline dark:hover:text-brand-200">{name || '—'}</Link>
            ) : (
              <p className="text-sm font-semibold text-ink">{name || '—'}</p>
            )}
            <p className="truncate font-mono text-[11px] text-ink-faint">{sub}</p>
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {meta.map((m) => (
            <div key={m.label} className="bg-surface2/60 px-2.5 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">{m.label}</p>
              <p className="mt-0.5 text-[13px] font-bold text-ink text-tabular">{m.value}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}