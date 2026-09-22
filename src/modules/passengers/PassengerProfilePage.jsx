import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CircleAlert, CreditCard, MapPin, Pencil, Route, Wallet as WalletIcon } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { passengerService } from '../../services/passengerService'
import { tripService } from '../../services/tripService'
import { fmtCurrency, fmtNumber, fmtDate, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { usePageGuard } from '../../components/common/PageGuard'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/Badge'
import { Rating } from '../../components/ui/Rating'
import { Button } from '../../components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { EmptyState } from '../../components/ui/States'
import { ActivityTimeline } from '../../components/operations/ActivityTimeline'
import { DataTable } from '../../components/tables/DataTable'

export default function PassengerProfilePage() {
  const guard = usePageGuard('passengers')
  if (guard) return guard

  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState('trips')

  const { data: pax, loading, mutate } = useAsync(() => passengerService.get(id), [id])
  const { data: trips } = useAsync(() => passengerService.getTrips(id), [id])
  const { data: payments } = useAsync(() => passengerService.getPayments(id), [id])
  const { data: complaints } = useAsync(() => passengerService.getComplaints(id), [id])
  const { data: activity } = useAsync(() => passengerService.getActivity(id), [id])

  const toggleStatus = async () => {
    const next = pax.status === 'active' ? 'suspended' : 'active'
    const res = await passengerService.setStatus(pax.id, next)
    mutate((prev) => (prev ? { ...prev, status: res.status } : prev))
    toast({ title: `${pax.name} ${next === 'active' ? 'activated' : 'suspended'}`, tone: next === 'active' ? 'success' : 'warning' })
  }

  const tripColumns = [
    { key: 'id', label: 'Trip', render: (t) => <Link to={`/trips/${t.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{t.id}</Link> },
    { key: 'route', label: 'Route', render: (t) => <span className="block max-w-[220px] truncate text-ink-soft">{t.pickup} → {t.destination}</span> },
    { key: 'distance', label: 'Distance', align: 'right', render: (t) => <span className="text-ink-soft text-tabular">{t.distanceKm} km</span> },
    { key: 'fare', label: 'Fare', align: 'right', tabular: true, render: (t) => <span className="font-semibold text-ink">{t.fare} AFN</span> },
    { key: 'status', label: 'Status', align: 'right', render: (t) => <StatusBadge status={STATUS.trip[t.status]} size="sm" /> },
    { key: 'when', label: 'When', align: 'right', render: (t) => <span className="text-xs text-ink-faint text-tabular">{fmtDate(t.requestedAt)}</span> },
  ]

  if (loading) return <div className="h-40" />

  if (!pax) {
    return <EmptyState title="Passenger not found" action={<Button variant="secondary" onClick={() => navigate('/passengers')}>Back to passengers</Button>} />
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="card-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={pax.name} size="xl" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-ink">{pax.name}</h1>
                <StatusBadge status={pax.status === 'active' ? { label: 'Active', tone: 'green' } : pax.status === 'suspended' ? { label: 'Suspended', tone: 'amber' } : { label: 'Banned', tone: 'red' }} />
              </div>
              <p className="font-mono text-xs text-ink-faint">{pax.id} · joined {fmtDate(pax.joined)}</p>
              <p className="mt-1 text-[13px] text-ink-soft">
                {pax.phone} · {pax.email} · {pax.city} · {pax.area}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => toast({ title: 'Edit mode', description: 'Passenger editing is available in the full admin suite.', tone: 'info' })}>Edit</Button>
            <Button variant={pax.status === 'active' ? 'danger-ghost' : 'primary'} onClick={toggleStatus}>
              {pax.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-5">
          {[
            { label: 'Trips', value: fmtNumber(pax.trips), icon: Route },
            { label: 'Completed', value: fmtNumber(pax.completed), icon: Route },
            { label: 'Total spent', value: fmtCurrency(pax.totalSpent), icon: CreditCard },
            { label: 'Wallet balance', value: fmtCurrency(pax.wallet), icon: WalletIcon, tone: 'text-brand-600 dark:text-brand-300' },
            { label: 'Avg rating', value: pax.rating ? <Rating value={pax.rating} showValue /> : '—', icon: null },
          ].map((s, i) => (
            <div key={i} className="bg-surface px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">{s.icon && <s.icon className="h-3.5 w-3.5" />}{s.label}</p>
              <p className={`mt-1 text-lg font-bold text-ink text-tabular ${s.tone || ''}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card-surface">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="px-4">
            <TabsTrigger value="trips">Trips <span className="ml-1.5 rounded-full bg-surface3 px-1.5 text-[10px] text-ink-faint text-tabular">{trips?.length || 0}</span></TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="complaints">Complaints <span className="ml-1.5 rounded-full bg-red-500/10 px-1.5 text-[10px] text-red-600 text-tabular">{complaints?.length || 0}</span></TabsTrigger>
            <TabsTrigger value="timeline">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            {trips?.length ? (
              <DataTable columns={tripColumns} rows={trips.slice(0, 20)} rowKey="id" density="compact" minWidth={720} />
            ) : (
              <EmptyState title="No trips yet" description="This rider hasn't completed a trip." />
            )}
          </TabsContent>

          <TabsContent value="payments">
            {payments?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-ink-faint">
                      <th className="px-5 py-2.5 font-semibold">Reference</th>
                      <th className="px-3 py-2.5 font-semibold">Trip</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Commission</th>
                      <th className="px-3 py-2.5 font-semibold">Method</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {payments.slice(0, 20).map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-surface2/60">
                        <td className="px-5 py-2.5 font-mono text-xs text-ink-soft">{p.ref}</td>
                        <td className="px-3 py-2.5"><Link to={`/trips/${p.tripId}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{p.tripId}</Link></td>
                        <td className="px-3 py-2.5 text-right font-semibold text-ink text-tabular">{p.amount} AFN</td>
                        <td className="px-3 py-2.5 text-right text-ink-soft text-tabular">{p.commission} AFN</td>
                        <td className="px-3 py-2.5 capitalize text-ink-soft">{p.method}</td>
                        <td className="px-5 py-2.5 text-right text-xs text-ink-faint text-tabular">{fmtDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No payments" description="Payment activity will appear here." />
            )}
          </TabsContent>

          <TabsContent value="complaints">
            {complaints?.length ? (
              <div className="divide-y divide-line/70">
                {complaints.map((c) => (
                  <Link key={c.id} to={`/complaints/${c.ticket}`} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface2/60">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink">{c.subject}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{c.ticket} · driver {c.driver} · {timeAgo(c.created)}</p>
                    </div>
                    <StatusBadge status={STATUS.complaint[c.status]} size="sm" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={CircleAlert} title="No complaints" description="This rider has an clean history." />
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <div className="px-5 py-5">
              <ActivityTimeline items={activity || []} className="max-w-md" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}