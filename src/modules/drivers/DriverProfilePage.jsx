import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Car, FileCheck2, MessageSquare, Navigation, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { driverService } from '../../services/driverService'
import { fmtCurrency, fmtNumber, timeAgo, fmtDateTime } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { usePageGuard } from '../../components/common/PageGuard'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Rating } from '../../components/ui/Rating'
import { Button } from '../../components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/States'
import { ActivityTimeline } from '../../components/operations/ActivityTimeline'
import { DataTable } from '../../components/tables/DataTable'
import { ProgressBar } from '../../components/ui/ProgressBar'

export default function DriverProfilePage() {
  const guard = usePageGuard('drivers')
  if (guard) return guard

  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState('overview')

  const { data: driver, loading, mutate } = useAsync(() => driverService.get(id), [id])
  const { data: trips } = useAsync(() => driverService.getTrips(id), [id])
  const { data: earnings } = useAsync(() => driverService.getEarnings(id), [id])

  const toggleStatus = async () => {
    if (!driver) return
    const next = driver.status === 'suspended' ? 'available' : 'suspended'
    await driverService.setStatus(driver.id, next)
    mutate((prev) => (prev ? { ...prev, status: next } : prev))
    toast({ title: `${driver.name} ${next === 'suspended' ? 'suspended' : 'reinstated'}`, tone: next === 'suspended' ? 'warning' : 'success' })
  }

  if (loading) return <div className="h-40" />
  if (!driver) return <EmptyState title="Driver not found" action={<Button variant="secondary" onClick={() => navigate('/drivers')}>Back to drivers</Button>} />

  const currentTrip = trips?.find((t) => ['in_progress', 'arriving', 'arrived', 'accepted'].includes(t.status))

  const tripColumns = [
    { key: 'id', label: 'Trip', render: (t) => <Link to={`/trips/${t.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{t.id}</Link> },
    { key: 'route', label: 'Route', render: (t) => <span className="block max-w-[220px] truncate text-ink-soft">{t.pickup} → {t.destination}</span> },
    { key: 'fare', label: 'Fare', align: 'right', tabular: true, render: (t) => <span className="font-semibold text-ink">{t.fare} AFN</span> },
    { key: 'commission', label: 'Commission', align: 'right', tabular: true, render: (t) => <span className="text-ink-soft">{t.commission} AFN</span> },
    { key: 'status', label: 'Status', align: 'right', render: (t) => <StatusBadge status={STATUS.trip[t.status]} size="sm" /> },
  ]

  const cancelRate = (driver.cancelled / Math.max(driver.rides, 1)) * 100

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="card-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={driver.name} size="xl" status={driver.status !== 'offline' && driver.status !== 'suspended' ? driver.status : undefined} />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-ink">{driver.name}</h1>
                <StatusBadge status={STATUS.driver[driver.status]} />
                <StatusBadge status={STATUS.verification[driver.verification]} />
              </div>
              <p className="font-mono text-xs text-ink-faint">{driver.id} · {driver.area}, {driver.city} · joined {fmtDateTime(driver.joined)}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{driver.phone} · {driver.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={MessageSquare} onClick={() => toast({ title: 'Message sent', description: `Notification dispatched to ${driver.name}`, tone: 'info' })}>Message</Button>
            <Button variant="secondary" onClick={() => navigate('/vehicles')}>Vehicle {driver.plate}</Button>
            <Button variant={driver.status === 'suspended' ? 'primary' : 'danger-ghost'} onClick={toggleStatus}>
              {driver.status === 'suspended' ? 'Reinstate' : 'Suspend'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-6">
          {[
            { label: 'Rating', value: <Rating value={driver.rating} showValue /> },
            { label: 'Trips', value: fmtNumber(driver.rides, { compact: true }) },
            { label: 'Earnings', value: fmtCurrency(driver.earnings, { compact: true }), tone: 'text-brand-600 dark:text-brand-300' },
            { label: 'Acceptance', value: `${driver.acceptanceRate}%` },
            { label: 'Cancellation', value: `${cancelRate.toFixed(1)}%` },
            { label: 'Online 30d', value: `${driver.onlineHours}h` },
          ].map((s, i) => (
            <div key={i} className="bg-surface px-4 py-3">
              <p className="text-[11px] font-medium text-ink-faint">{s.label}</p>
              <p className={`mt-1 text-lg font-bold text-ink ${s.tone || ''}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card-surface">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="px-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trips">Trips <span className="ml-1.5 rounded-full bg-surface3 px-1.5 text-[10px] text-ink-faint text-tabular">{trips?.length || 0}</span></TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
              {/* Verification pipeline */}
              <div className="lg:col-span-2">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Verification pipeline</p>
                <ol className="space-y-0">
                  {[
                    { label: 'Personal information', meta: 'ID + selfie matched', state: 'done' },
                    { label: 'Documents', meta: driver.vehicle?.documents.map((d) => d.status).every((s) => s === 'verified') ? 'All verified' : 'Pending review', state: driver.vehicle?.documents?.some((d) => d.status !== 'verified') ? 'current' : 'done' },
                    { label: 'Vehicle verification', meta: `${driver.vehicle?.brand} · ${driver.plate}`, state: driver.vehicleType ? 'done' : 'current' },
                    { label: 'Compliance review', meta: `Next inspection in ${driver.vehicle?.nextService} days`, state: driver.verification === 'verified' ? 'done' : 'current' },
                    { label: 'Approval', meta: driver.verification === 'verified' ? 'Approved · can accept rides' : 'Awaiting decision', state: driver.verification === 'verified' ? 'done' : 'muted' },
                  ].map((s, i) => (
                    <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < 4 && <span className={`absolute left-[5px] top-4 h-full w-px ${s.state === 'done' ? 'bg-brand-500/50' : 'bg-line'}`} />}
                      <span className={`relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-surface ${s.state === 'done' ? 'bg-brand-600' : s.state === 'current' ? 'bg-blue-500 animate-pulse-soft' : 'bg-slate-300'}`} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-ink">{s.label}</p>
                        <p className="text-xs text-ink-soft">{s.meta}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {driver.vehicle?.documents.map((d) => (
                    <div key={d.name} className="rounded-lg border border-line p-3">
                      <div className="flex items-center justify-between">
                        <FileCheck2 className="h-4 w-4 text-ink-faint" />
                        <StatusBadge status={STATUS.verification[d.status]} size="sm" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-ink">{d.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle + current trip */}
              <div className="space-y-4">
                {currentTrip ? (
                  <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" /></span>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">In a live trip</p>
                    </div>
                    <Link to={`/trips/${currentTrip.id}`} className="mt-2 block font-mono text-sm font-bold text-ink hover:underline">{currentTrip.id}</Link>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft"><Navigation className="h-3.5 w-3.5" />{currentTrip.passenger} · {currentTrip.pickup}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">→ {currentTrip.destination}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
                      <span className="text-tabular">{currentTrip.distanceKm} km</span>
                      <span className="text-tabular">{fmtCurrency(currentTrip.fare)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-line p-4">
                    <div className="flex items-center gap-2 text-ink-faint"><Car className="h-4 w-4" /><p className="text-xs font-medium">Not on a trip</p></div>
                  </div>
                )}

                <div className="rounded-xl border border-line p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Assigned vehicle</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface3" style={{ backgroundColor: `${driver.vehicle?.colorHex}22` }}>
                      <Car className="h-5 w-5 text-ink-soft" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{driver.vehicle?.brand} · {driver.vehicle?.year}</p>
                      <p className="font-mono text-xs text-ink-soft">{driver.plate} · {driver.vehicle?.color}</p>
                    </div>
                    <Badge tone={driver.vehicleStatus === 'active' ? 'green' : 'slate'}>{driver.vehicleStatus}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-ink-faint">
                      <span>Inspections</span>
                      <span className="text-tabular">{driver.vehicle?.documents.filter((d) => d.status === 'verified').length}/3 verified</span>
                    </div>
                    <ProgressBar value={(driver.vehicle?.documents.filter((d) => d.status === 'verified').length / 3) * 100} tone="green" />
                  </div>
                </div>

                <div className="rounded-xl border border-line p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Settlement</p>
                  {earnings ? (
                    <div className="mt-2 space-y-1.5 text-[13px]">
                      <Row label="Current wallet" value={fmtCurrency(earnings.wallet)} />
                      <Row label="Pending settlement" value={fmtCurrency(earnings.pending)} tone="text-amber-600 dark:text-amber-300" />
                      <Row label="Lifetime commission" value={fmtCurrency(earnings.commission)} />
                      <Row label="Withdrawals" value={String(earnings.withdrawals)} />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-ink-faint">—</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trips">
            {trips?.length ? (
              <DataTable columns={tripColumns} rows={trips.slice(0, 24)} rowKey="id" density="compact" minWidth={680} />
            ) : (
              <EmptyState title="No trips yet" />
            )}
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'Gross earnings', value: fmtCurrency(earnings?.earnings || 0), tone: 'text-emerald-600 dark:text-emerald-300' },
                { label: 'Settled', value: fmtCurrency(earnings?.settled || 0) },
                { label: 'Pending', value: fmtCurrency(earnings?.pending || 0), tone: 'text-amber-600 dark:text-amber-300' },
                { label: 'Commission', value: fmtCurrency(earnings?.commission || 0) },
                { label: 'Avg / trip', value: fmtCurrency((earnings?.earnings || 0) / Math.max(driver.rides, 1)) },
              ].map((s, i) => (
                <div key={i} className="bg-surface px-4 py-3.5">
                  <p className="text-[11px] font-medium text-ink-faint">{s.label}</p>
                  <p className={`mt-1 text-lg font-bold text-tabular ${s.tone || 'text-ink'}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="px-5 py-5">
              <ActivityTimeline
                className="max-w-md"
                items={[
                  { label: 'Went online', meta: driver.area, ts: driver.lastActive, state: driver.status === 'offline' ? 'muted' : 'done' },
                  { label: 'Document verified', meta: 'Insurance · renewal processed', ts: driver.joined + 1000 * 3600 * 24 * 30 }, // eslint-disable-line no-magic-numbers
                  { label: 'Vehicle inspection passed', meta: driver.plate, ts: driver.joined },
                  { label: 'Account approved', meta: 'KYC complete', ts: driver.joined - 1000 * 3600 * 24 * 2 },
                  { label: 'Application submitted', meta: 'Web onboarding', ts: driver.joined - 1000 * 3600 * 24 * 5 },
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Row({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className={`font-semibold text-tabular ${tone || 'text-ink'}`}>{value}</span>
    </div>
  )
}