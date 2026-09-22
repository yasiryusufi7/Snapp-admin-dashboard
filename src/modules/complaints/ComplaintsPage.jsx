import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, MessageSquareText, ShieldAlert, UserCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { complaintService } from '../../services/complaintService'
import { STATUS } from '../../utils/constants'
import { timeAgo } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { StatCard } from '../../components/charts/StatCard'
import { Badge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SearchInput } from '../../components/ui/Input'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/States'
import { usePageGuard } from '../../components/common/PageGuard'

const PRIORITY_TONE = { critical: 'red', high: 'amber', medium: 'blue', low: 'slate' }
const CATEGORY_LABEL = {
  driver_behavior: 'Driver behavior',
  passenger_behavior: 'Passenger behavior',
  fare_dispute: 'Fare dispute',
  lost_item: 'Lost item',
  payment_issue: 'Payment issue',
  trip_issue: 'Trip issue',
  technical: 'Technical',
  other: 'Other',
}

const AGENTS = ['Ahmad Karimi', 'Farid Rahimi', 'Maryam Noori', 'Habib Safi']

export default function ComplaintsPage() {
  const guard = usePageGuard('complaints')
  if (guard) return guard

  const navigate = useNavigate()
  const { ticket: ticketParam } = useParams()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(undefined)
  const [priority, setPriority] = useState(undefined)
  const [category, setCategory] = useState(undefined)
  const [selected, setSelected] = useState(ticketParam || null)

  const { data, loading } = useAsync(
    () => complaintService.list({ search, filters: { status, priority, category } }),
    [search, status, priority, category],
  )
  const items = data?.items || []

  const open = items.filter((c) => ['new', 'in_review', 'assigned', 'waiting'].includes(c.status))
  const critical = items.filter((c) => c.priority === 'critical' && !['resolved', 'closed'].includes(c.status))

  const slaHours = (c) => Math.round((Date.now() - c.created) / 3600000)
  const slaTarget = (p) => (p === 'critical' ? 4 : p === 'high' ? 12 : p === 'medium' ? 24 : 48)

  const rows = useMemo(() => {
    return items.map((c) => {
      const age = slaHours(c)
      const target = slaTarget(c.priority)
      return { ...c, age, target, breached: c.status !== 'resolved' && c.status !== 'closed' && age > target }
    })
  }, [items])

  const card = (c) => (
    <button
      key={c.ticket}
      onClick={() => navigate(`/complaints/${c.ticket}`)}
      className={`w-full rounded-xl border p-4 text-left transition ${selected === c.ticket ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/40' : 'border-line hover:border-line-strong hover:bg-surface2/40'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={PRIORITY_TONE[c.priority]}>P{c.priority[0].toUpperCase()}</Badge>
          <StatusBadge status={STATUS.complaint[c.status]} size="sm" />
        </div>
        {c.breached && <Badge tone="red">SLA breached</Badge>}
      </div>
      <p className="mt-2.5 text-[13px] font-semibold leading-snug text-ink">{c.subject}</p>
      <p className="mt-1 truncate text-xs text-ink-soft">{CATEGORY_LABEL[c.category]} · {c.passenger} vs {c.driver}</p>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-faint">
        <span className="font-mono text-[10.5px]">{c.ticket}</span>
        <span className="text-tabular">{timeAgo(c.created)}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`h-1 w-1 rounded-full ${c.breached ? 'bg-red-500' : c.age > c.target * 0.7 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
        <span className="text-[10.5px] text-ink-faint text-tabular">{c.assignedTo || 'Unassigned'}</span>
      </div>
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Complaints"
        description="Trust & safety queue: rider and driver reports with SLA tracking."
        actions={critical.length > 0 ? <Badge tone="red"><ShieldAlert className="h-3.5 w-3.5" /> {critical.length} critical</Badge> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open queue" value={String(open.length)} icon={MessageSquareText} hint="New + in review + assigned" />
        <StatCard label="Critical" value={String(critical.length)} icon={AlertTriangle} tone="red" hint="4h SLA target" />
        <StatCard label="Resolved" value={String(items.filter((c) => c.status === 'resolved').length)} icon={CheckCircle2} tone="green" />
        <StatCard label="Avg first response" value="3h 12m" icon={UserCheck} hint="This week" />
      </div>

      <FilterBar
        onClear={() => { setSearch(''); setStatus(undefined); setPriority(undefined); setCategory(undefined) }}
        dirty={Boolean(search || status || priority || category)}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search ticket, subject, name…" className="w-64" />
        <FilterSelect label="Status" value={status} onChange={setStatus} placeholder="All statuses" options={Object.entries(STATUS.complaint).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="Priority" value={priority} onChange={setPriority} placeholder="All priorities" options={Object.entries(PRIORITY_TONE).map(([k]) => ({ value: k, label: k }))} />
        <FilterSelect label="Category" value={category} onChange={setCategory} placeholder="All categories" options={Object.entries(CATEGORY_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
      </FilterBar>

      {loading ? (
        <div className="h-40 animate-pulse" />
      ) : rows.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map(card)}</div>
      ) : (
        <EmptyState icon={CheckCircle2} title="Queue is clear" description="No complaints match the current filters." />
      )}

      {selected && (
        <ComplaintDrawer
          complaint={rows.find((c) => c.ticket === selected) || items.find((c) => c.ticket === selected)}
          onClose={() => { setSelected(null); if (ticketParam) navigate('/complaints') }}
          onToast={toast}
        />
      )}
    </div>
  )
}

function ComplaintDrawer({ complaint, onClose, onToast }) {
  if (!complaint) return null
  const ageHours = Math.round((Date.now() - complaint.created) / 3600000)
  const targetHours = complaint.target || (complaint.priority === 'critical' ? 4 : complaint.priority === 'high' ? 12 : complaint.priority === 'medium' ? 24 : 48)

  const setState = (s, msg) => {
    complaintService.updateStatus(complaint.ticket, s)
    onToast({ title: `Ticket moved to ${s}`, description: msg, tone: 'success' })
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={complaint.subject}
      description={`${complaint.ticket} · ${CATEGORY_LABEL[complaint.category]} · ${timeAgo(complaint.created)}`}
      width="w-[30rem]"
      footer={
        <>
          <Button variant="secondary" onClick={() => setState('waiting', 'Passenger asked for more info.')}>Wait on user</Button>
          <Button variant="danger" onClick={() => setState('resolved', 'Resolution recorded.')}>Resolve</Button>
          <Button icon={CheckCircle2} onClick={() => setState('closed', 'Ticket closed with resolution.')}>Close</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={PRIORITY_TONE[complaint.priority]}>priority · {complaint.priority}</Badge>
          <StatusBadge status={STATUS.complaint[complaint.status]} />
          <Badge tone="slate">{ageHours}h old · SLA {targetHours}h</Badge>
        </div>

        <div className="rounded-xl border border-line p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Report</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{complaint.description}</p>
          <p className="mt-2 text-xs text-ink-faint">Files attached: {complaint.attachments || 0}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Party name={complaint.passenger} label="Rider" ticket={complaint.ticket} />
          <Party name={complaint.driver} label="Driver" ticket={complaint.ticket} />
          <div className="rounded-lg border border-line px-3 py-2.5">
            <p className="text-[11px] text-ink-faint">Trip</p>
            <p className="text-sm font-semibold text-ink">{complaint.tripId}</p>
          </div>
          <div className="rounded-lg border border-line px-3 py-2.5">
            <p className="text-[11px] text-ink-faint">Assigned agent</p>
            <p className="text-sm font-semibold text-ink">{complaint.assignedTo || 'Unassigned'}</p>
          </div>
        </div>

        {complaint.internalNotes && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">Internal notes</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{complaint.internalNotes}</p>
          </div>
        )}

        {complaint.resolution && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Resolution</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{complaint.resolution}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Assign to agent</p>
          <div className="flex flex-wrap gap-1.5">
            {AGENTS.map((a) => (
              <button
                key={a}
                onClick={() => { complaintService.assign(complaint.ticket, a); onToast({ title: `Assigned to ${a}`, tone: 'info' }) }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${complaint.assignedTo === a ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-200' : 'border-line text-ink-soft hover:border-line-strong'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

function Party({ name, label, ticket }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2.5">
      <p className="text-[11px] text-ink-faint">{label}</p>
      <p className="truncate text-sm font-semibold text-ink">{name}</p>
    </div>
  )
}