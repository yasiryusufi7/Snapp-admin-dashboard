import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AtSign, CalendarClock, ClipboardPlus, Megaphone, Radio, UsersRound, FileCheck2, Check, X, Eye, UserPlus, BellRing } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { notificationService } from '../../services/notificationService'
import { fmtDateTime, fmtNumber } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { StatCard } from '../../components/charts/StatCard'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton } from '../../components/ui/Button'
import { MoreHorizontal } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'
import { registrationService } from '../../services/registrationService'

const AUDIENCE_TONE = { drivers: 'blue', passengers: 'violet', all: 'teal' }
const TYPE_TONE = {
  push: 'blue',
  promo: 'violet',
  announcement: 'amber',
  operational: 'teal',
  system: 'slate',
  policy: 'red',
  registration: 'brand',
}

export default function NotificationsPage() {
  const guard = usePageGuard('notifications')
  const navigate = useNavigate()

  const { toast } = useToast()
  const [composing, setComposing] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [declineReason, setDeclineReason] = useState('Documents failed verification.')
  const [reviewBusy, setReviewBusy] = useState(false)

  const { data: totals } = useAsync(() => notificationService.outreachTotals(), [])
  const { data: notifications, loading, reload: reloadNotifications } = useAsync(() => notificationService.list({ pageSize: 80 }), [])
  const { data: registrations, reload: reloadRegistrations } = useAsync(() => registrationService.list({ pageSize: 100 }), [])
  const registrationRows = registrations?.items || []

  const refreshReviews = async () => {
    await Promise.all([reloadNotifications(), reloadRegistrations()])
  }

  const sortedRegistrations = [...registrationRows].sort(
    (a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.submittedAt - a.submittedAt,
  )

  const simulateIncoming = async () => {
    const reg = await registrationService.simulate()
    await Promise.all([reloadNotifications(), reloadRegistrations()])
    toast({ title: 'New driver registration received', description: `${reg.name} · ${reg.city} · ${reg.vehicle.brand} — awaiting document review.`, tone: 'info' })
  }

  const openRegistration = (row) => {
    const reg = registrationRows.find((r) => r.id === row.registrationId)
    if (!reg) {
      toast({ title: 'Application not found', tone: 'error' })
      return
    }
    if (reg.status !== 'pending') {
      toast({ title: 'Application already handled', description: `${reg.name} · ${STATUS.notification[reg.status].label}`, tone: 'info' })
      return
    }
    setDeclineReason('Documents failed verification.')
    setSelectedRegistration(reg)
  }

  const verifyDocument = async (reg, doc) => {
    const result = await registrationService.verifyDocument(reg.id, doc.name)
    setSelectedRegistration((current) => current?.id === reg.id ? { ...current, documents: current.documents.map((item) => item.name === doc.name ? { ...item, status: result.status } : item) } : current)
    await refreshReviews()
    toast({ title: 'Document verified', description: doc.name, tone: 'success' })
  }

  const decideRegistration = async (decision) => {
    if (!selectedRegistration || reviewBusy) return
    setReviewBusy(true)
    try {
      if (decision === 'approve') await registrationService.approve(selectedRegistration.id)
      else await registrationService.decline(selectedRegistration.id, { reason: declineReason })
      await Promise.all([reloadNotifications(), reloadRegistrations()])
      setSelectedRegistration(null)
      toast({ title: decision === 'approve' ? 'Driver approved' : 'Application declined', description: decision === 'approve' ? 'The new driver is now in the Drivers tab.' : 'The application has been declined.', tone: decision === 'approve' ? 'success' : 'warning' })
    } catch (error) {
      toast({ title: 'Could not update application', description: error.message, tone: 'error' })
    } finally { setReviewBusy(false) }
  }

  const create = async (payload) => {
    await notificationService.create(payload)
    reloadNotifications()
    setComposing(false)
    toast({ title: payload.scheduleFor ? 'Notification scheduled' : 'Notification saved as draft', tone: 'success' })
  }

  const delRate = (n) => (n.sent ? Math.round((n.delivered / n.sent) * 100) : 0)
  const readRate = (n) => (n.delivered ? Math.round((n.read / n.delivered) * 100) : 0)

  const columns = (rows) =>
    rows.map((n) => (
      <div key={n.id} className="grid grid-cols-[minmax(260px,1.4fr)_92px_110px_1fr_110px_130px_44px] items-center gap-3 px-5 py-3 text-[13px]">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{n.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
            <span className="font-mono">{n.id}</span> · {fmtDateTime(n.createdAt)} · {n.creator}
          </p>
        </div>
        <Badge tone={AUDIENCE_TONE[n.audience]}>{n.audience}</Badge>
        <Badge tone={TYPE_TONE[n.type]}>{n.type}</Badge>
        {n.kind === 'driver_registration' ? (
          <div>
            <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint"><span>documents</span><span className="text-tabular">{n.docsVerified}/{n.docsTotal} verified</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface3">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${n.docsTotal ? Math.min(100, Math.round((n.docsVerified / n.docsTotal) * 100)) : 0}%` }} />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint"><span>delivered</span><span className="text-tabular">{fmtNumber(n.delivered, { compact: true })}</span></div>
            <div className="flex gap-0.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface3">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, delRate(n))}%` }} />
              </div>
            </div>
          </div>
        )}
        {n.kind === 'driver_registration' ? (
          <div className="min-w-0">
            <div className="mb-1 text-[10.5px] text-ink-faint">applicant city</div>
            <p className="truncate text-xs font-medium text-ink-soft">{n.city}</p>
          </div>
        ) : (
          <div>
            <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint"><span>opened</span><span className="text-tabular">{fmtNumber(n.read, { compact: true })}</span></div>
            <div className="flex gap-0.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface3">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, readRate(n))}%` }} />
              </div>
            </div>
          </div>
        )}
        <div className="text-right">
          {n.scheduledFor ? <p className="flex items-center justify-end gap-1 text-xs font-semibold text-amber-600 text-tabular"><CalendarClock className="h-3.5 w-3.5" />{fmtDateTime(n.scheduledFor)}</p> : <StatusBadge status={STATUS.notification[n.status]} size="sm" />}
        </div>
        <Menu label="Notification actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          {n.kind === 'driver_registration' ? (
            <>
              <MenuItem icon={Eye} onClick={() => openRegistration(n)}>Review application</MenuItem>
              {n.driverId && <MenuItem icon={UsersRound} onClick={() => navigate(`/drivers/${n.driverId}`)}>View driver</MenuItem>}
            </>
          ) : (
            <>
              <MenuItem icon={AtSign} onClick={() => toast({ title: 'Segments', description: 'Audience targeting config will open.', tone: 'info' })}>View audience</MenuItem>
              <MenuItem danger onClick={() => toast({ title: 'Draft queued', description: 'Notification sent to approval flow.', tone: 'info' })}>Send for approval</MenuItem>
            </>
          )}
        </Menu>
      </div>
    ))

  if (guard) return guard

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Notifications"
        description="Review driver applications and manage messages sent to your rider and driver communities."
        actions={<Button icon={Megaphone} onClick={() => setComposing(true)}>Compose broadcast</Button>}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard label="Total sent" value={fmtNumber(totals?.sent, { compact: true })} icon={Radio} />
        <StatCard label="Delivered" value={fmtNumber(totals?.delivered, { compact: true })} icon={AtSign} tone="green" />
        <StatCard label="Opened" value={fmtNumber(totals?.read, { compact: true })} icon={UsersRound} tone="violet" />
        <StatCard label="Overall open rate" value={`${((totals?.read || 0) / Math.max(totals?.delivered || 1)) * 100 >= 0 ? Math.round((totals?.read || 0) / Math.max(totals?.delivered || 1) * 100) : 0}%`} icon={ClipboardPlus} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          icon={FileCheck2}
          title="Driver registration requests"
          description={`${registrationRows.filter((reg) => reg.status === 'pending').length} awaiting review · applications from the driver app`}
          actions={<Button variant="secondary" size="sm" icon={UserPlus} onClick={simulateIncoming}>Add demo request</Button>}
        />
        {sortedRegistrations.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedRegistrations.map((reg) => <div key={reg.id} className={`flex min-w-0 flex-col rounded-xl border p-4 transition-colors ${reg.status === 'pending' ? 'border-brand-500/25 bg-brand-500/[0.035] hover:border-brand-500/45' : 'border-line bg-surface'}`}>
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-semibold text-ink">{reg.name}</p><p className="mt-0.5 font-mono text-[11px] text-ink-faint">{reg.id}</p></div><StatusBadge status={STATUS.notification[reg.status]} size="sm" /></div>
            <p className="mt-3 truncate text-xs font-medium text-ink-soft">{reg.area}, {reg.city}</p>
            <p className="mt-1 truncate text-xs text-ink-faint">{reg.vehicle.brand} {reg.vehicle.type} · <span className="font-mono">{reg.vehicle.plate}</span></p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/70 pt-3"><span className="text-xs text-ink-soft">{reg.documents.filter((d) => d.status === 'verified').length} of {reg.documents.length} documents checked</span>
              {reg.status === 'pending' ? <Button variant="secondary" size="sm" icon={Eye} onClick={() => { setDeclineReason('Documents failed verification.'); setSelectedRegistration(reg) }}>Review</Button> : reg.driverId ? <Button variant="ghost" size="sm" onClick={() => navigate(`/drivers/${reg.driverId}`)}>Open driver</Button> : null}
            </div>
            {reg.status === 'declined' && reg.declineReason && <p className="mt-2 text-xs text-red-600">{reg.declineReason}</p>}
          </div>)}
        </div> : <div className="flex flex-col items-center px-5 py-10 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface2 text-ink-faint"><BellRing className="h-5 w-5" /></span><p className="mt-3 text-sm font-semibold text-ink">No applications yet</p><p className="mt-1 max-w-sm text-xs text-ink-faint">New driver registrations sent from the app will appear here for document review.</p></div>}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Outreach history" description="Delivery funnel per broadcast" />
        <div className="overflow-x-auto"><div className={loading ? 'animate-pulse' : ''}>
          {notifications?.items?.length ? columns(notifications.items) : <p className="px-5 py-10 text-center text-sm text-ink-faint">No notifications.</p>}
        </div></div>
      </Card>

      {composing && <ComposeModal onClose={() => setComposing(false)} onCreate={create} />}
      {selectedRegistration && <Modal open onClose={() => setSelectedRegistration(null)} title="Review driver application" description={`${selectedRegistration.id} · submitted ${fmtDateTime(selectedRegistration.submittedAt)}`} footer={<><Button variant="secondary" onClick={() => setSelectedRegistration(null)}>Close</Button><Button variant="danger" icon={X} disabled={reviewBusy} onClick={() => decideRegistration('decline')}>Decline</Button><Button icon={Check} disabled={reviewBusy || selectedRegistration.documents.some((d) => d.status !== 'verified')} onClick={() => decideRegistration('approve')}>Approve driver</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface2 p-3 text-sm"><div><span className="text-ink-faint">Applicant</span><p className="font-semibold text-ink">{selectedRegistration.name}</p></div><div><span className="text-ink-faint">Contact</span><p className="text-ink">{selectedRegistration.phone}</p></div><div><span className="text-ink-faint">License</span><p className="font-mono text-ink">{selectedRegistration.licenseNo}</p></div><div><span className="text-ink-faint">Location</span><p className="text-ink">{selectedRegistration.area}, {selectedRegistration.city}</p></div><div><span className="text-ink-faint">Vehicle</span><p className="text-ink">{selectedRegistration.vehicle.brand} · {selectedRegistration.vehicle.type} · {selectedRegistration.vehicle.year}</p></div><div><span className="text-ink-faint">Plate</span><p className="font-mono text-ink">{selectedRegistration.vehicle.plate}</p></div></div>
          <div><p className="mb-2 text-sm font-semibold text-ink">Submitted documents</p><div className="space-y-2">{selectedRegistration.documents.map((doc) => <div key={doc.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2"><div><p className="text-sm font-medium text-ink">{doc.name}</p><p className="text-xs capitalize text-ink-faint">{doc.status}</p></div>{doc.status === 'verified' ? <Badge tone="green">Verified</Badge> : <Button size="sm" variant="secondary" icon={Check} onClick={() => verifyDocument(selectedRegistration, doc)}>Mark verified</Button>}</div>)}</div></div>
          <Field label="Decline reason"><Input value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} /></Field>
          {selectedRegistration.documents.some((d) => d.status !== 'verified') && <p className="text-xs text-amber-700">Verify every document before approving this application.</p>}
        </div>
      </Modal>}
    </div>
  )
}

function ComposeModal({ onClose, onCreate }) {
  const [draft, setDraft] = useState({
    title: '',
    audience: 'drivers',
    type: 'push',
    scheduleFor: '',
  })

  return (
    <Modal
      open
      onClose={onClose}
      title="Compose broadcast"
      description="Segment, draft and schedule an outreach"
      footer={
        <>
          <Button variant="secondary" onClick={() => onCreate({ ...draft, type: draft.type, sent: 0 })}>Save as draft</Button>
          <Button icon={Megaphone} onClick={() => onCreate({ ...draft })}>Schedule broadcast</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Subject" required>
          <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Weekend surge advisory" />
        </Field>
        <Field label="Message">
          <Textarea rows={3} placeholder="Body text…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Audience">
            <Select value={draft.audience} onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value }))}>
              <option value="drivers">Drivers</option>
              <option value="passengers">Passengers</option>
              <option value="all">Everyone</option>
            </Select>
          </Field>
          <Field label="Channel">
            <Select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}>
              <option value="push">Push</option>
              <option value="promo">In-app promo</option>
              <option value="announcement">Announcement</option>
              <option value="policy">Policy notice</option>
            </Select>
          </Field>
        </div>
        <Field label="Schedule (leave empty for immediate)">
          <Input type="datetime-local" value={draft.scheduleFor} onChange={(e) => setDraft((d) => ({ ...d, scheduleFor: e.target.value }))} />
        </Field>
        <div className="rounded-lg bg-brand-500/5 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
          High-priority push broadcast to <span className="font-semibold text-ink">{draft.audience}</span> · open-rate anatomy from past campaigns: <span className="font-semibold text-ink">delivery 96% · open 41%</span>.
        </div>
      </div>
    </Modal>
  )
}
