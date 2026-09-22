import { useState } from 'react'
import { AtSign, CalendarClock, ClipboardPlus, Megaphone, Radio, UsersRound } from 'lucide-react'
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
import { ProgressBar } from '../../components/ui/ProgressBar'

const AUDIENCE_TONE = { drivers: 'blue', passengers: 'violet', all: 'teal' }
const TYPE_TONE = {
  push: 'blue',
  promo: 'violet',
  announcement: 'amber',
  operational: 'teal',
  system: 'slate',
  policy: 'red',
}

export default function NotificationsPage() {
  const guard = usePageGuard('notifications')
  if (guard) return guard

  const { toast } = useToast()
  const [composing, setComposing] = useState(false)

  const { data: totals } = useAsync(() => notificationService.outreachTotals(), [])
  const { data: notifications, loading, mutate } = useAsync(() => notificationService.list({ pageSize: 80 }), [])

  const create = async (payload) => {
    await notificationService.create(payload)
    mutate()
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
        <div>
          <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint"><span>delivered</span><span className="text-tabular">{fmtNumber(n.delivered, { compact: true })}</span></div>
          <div className="flex gap-0.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface3">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, delRate(n))}%` }} />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint"><span>opened</span><span className="text-tabular">{fmtNumber(n.read, { compact: true })}</span></div>
          <div className="flex gap-0.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface3">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, readRate(n))}%` }} />
            </div>
          </div>
        </div>
        <div className="text-right">
          {n.scheduledFor ? <p className="flex items-center justify-end gap-1 text-xs font-semibold text-amber-600 text-tabular"><CalendarClock className="h-3.5 w-3.5" />{fmtDateTime(n.scheduledFor)}</p> : <StatusBadge status={STATUS.notification[n.status]} size="sm" />}
        </div>
        <Menu label="Notification actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          <MenuItem icon={AtSign} onClick={() => toast({ title: 'Segments', description: 'Audience targeting config will open.', tone: 'info' })}>View audience</MenuItem>
          <MenuItem danger onClick={() => toast({ title: 'Draft queued', description: 'Notification sent to approval flow.', tone: 'info' })}>Send for approval</MenuItem>
        </Menu>
      </div>
    ))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Notifications"
        description="Outreach to drivers and passengers: push, in-app and policy announcements."
        actions={<Button icon={Megaphone} onClick={() => setComposing(true)}>Compose broadcast</Button>}
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total sent" value={fmtNumber(totals?.sent, { compact: true })} icon={Radio} />
        <StatCard label="Delivered" value={fmtNumber(totals?.delivered, { compact: true })} icon={AtSign} tone="green" />
        <StatCard label="Opened" value={fmtNumber(totals?.read, { compact: true })} icon={UsersRound} tone="violet" />
        <StatCard label="Overall open rate" value={`${((totals?.read || 0) / Math.max(totals?.delivered || 1)) * 100 >= 0 ? Math.round((totals?.read || 0) / Math.max(totals?.delivered || 1) * 100) : 0}%`} icon={ClipboardPlus} />
      </div>

      <Card>
        <CardHeader title="Outreach history" description="Delivery funnel per broadcast" />
        <div className={loading ? 'animate-pulse' : ''}>
          {notifications?.length ? columns(notifications) : <p className="px-5 py-10 text-center text-sm text-ink-faint">No notifications.</p>}
        </div>
      </Card>

      {composing && <ComposeModal onClose={() => setComposing(false)} onCreate={create} />}
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