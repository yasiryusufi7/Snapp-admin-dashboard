import { useMemo, useState } from 'react'
import { BadgePercent, Copy, Megaphone, Pause, Play, Plus, UsersRound } from 'lucide-react'
import { db } from '../../data/db'
import { fmtCurrency, fmtDate } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { StatCard } from '../../components/charts/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'

export default function CampaignsPage() {
  const guard = usePageGuard('campaigns')
  if (guard) return guard

  const { toast } = useToast()
  const [rows, setRows] = useState(db.campaigns)
  const [creating, setCreating] = useState(false)

  const active = rows.filter((c) => c.status === 'active')
  const totalCost = rows.reduce((s, c) => s + c.cost, 0)
  const totalRevenue = rows.reduce((s, c) => s + c.revenue, 0)
  const totalRedemptions = rows.reduce((s, c) => s + c.redemptions, 0)

  const blended = useMemo(() => (totalCost ? totalRevenue / totalCost : 0), [totalCost, totalRevenue])

  const toggle = (c) => {
    setRows((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: x.status === 'active' ? 'ended' : 'active' } : x)))
    toast({ title: `${c.name} ${c.status === 'active' ? 'paused' : 'reactivated'}`, tone: c.status === 'active' ? 'warning' : 'success' })
  }

  const duplicate = (c) => {
    setRows((prev) => [...prev, { ...c, id: `CMPG-${999 + prev.length}`, status: 'active', redemptions: 0 }])
    toast({ title: 'Campaign duplicated', description: `${c.name} cloned as a fresh copy.`, tone: 'info' })
  }

  const create = (draft) => {
    setRows((prev) => [...prev, { id: `CMPG-${999 + prev.length}`, status: draft.scheduleNow ? 'active' : 'draft', redemptions: 0, cost: 0, revenue: 0, budget: 0, cities: [['kbl']], ...draft }])
    setCreating(false)
    toast({ title: 'Campaign created', description: draft.scheduleNow ? 'Launched and now serving redemptions.' : 'Saved as draft for review.', tone: 'success' })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Campaigns"
        description="Promotions, incentives and lifecycle programs with performance economics."
        actions={<Button icon={Plus} onClick={() => setCreating(true)}>New campaign</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active campaigns" value={String(active.length)} icon={Megaphone} hint={`${rows.length} total`} />
        <StatCard label="Blended ROI" value={`${blended.toFixed(2)}×`} icon={BadgePercent} trend={{ up: 0.3 }} hint="Revenue per 1AFN discount" />
        <StatCard label="Discount spend" value={fmtCurrency(totalCost, { compact: true })} icon={BadgePercent} hint="Lifetime disbursed" />
        <StatCard label="Redemptions" value={totalRedemptions.toLocaleString()} icon={UsersRound} hint="Unique coupon uses" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((c) => {
          const roas = c.cost ? (c.revenue / c.cost).toFixed(2) : '—'
          const spentPct = c.budget ? Math.min(100, Math.round((c.cost / c.budget) * 100)) : 0
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 px-5 pt-4">
                <div>
                  <Badge tone={c.status === 'active' ? 'green' : c.status === 'ended' ? 'slate' : 'amber'}>{c.status}</Badge>
                  <h3 className="mt-2 text-sm font-bold leading-snug text-ink">{c.name}</h3>
                  <p className="mt-0.5 font-mono text-[10.5px] text-ink-faint">{c.id} · {c.couponCode}</p>
                </div>
                <span className="font-mono rounded-md bg-surface3 px-1.5 py-0.5 text-[10.5px] font-semibold text-brand-700 dark:text-brand-200">{c.discountType === 'percent' ? `${c.discountValue}% off` : `${c.discountValue} AFN off`}</span>
              </div>

              <div className="px-5 py-3.5">
                <div className="grid grid-cols-3 gap-2">
                  <Mini label="Used" value={c.redemptions.toLocaleString()} />
                  <Mini label="Budget" value={fmtCurrency(c.budget, { compact: true })} />
                  <Mini label="A/R" value={`${roas}×`} tone={Number(roas) > 2 ? 'text-emerald-600' : 'text-amber-600'} />
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10.5px] text-ink-faint">
                    <span>Budget consumed</span>
                    <span className="text-tabular">{spentPct}%</span>
                  </div>
                  <ProgressBar value={spentPct} size="xs" tone={spentPct > 85 ? 'amber' : 'green'} />
                </div>
                <p className="mt-3 text-[11px] text-ink-faint text-tabular">{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</p>
              </div>

              <div className="mt-auto flex items-center gap-1.5 border-t border-line px-4 py-3">
                <Button size="xs" variant={c.status === 'active' ? 'ghost' : 'primary'} icon={c.status === 'active' ? Pause : Play} onClick={() => toggle(c)}>
                  {c.status === 'active' ? 'Pause' : c.status === 'ended' ? 'Restart' : 'Launch'}
                </Button>
                <Button size="xs" variant="ghost" icon={Copy} onClick={() => duplicate(c)}>Duplicate</Button>
              </div>
            </Card>
          )
        })}
      </div>

      {creating && (
        <CampaignModal onClose={() => setCreating(false)} onCreate={create} />
      )}
    </div>
  )
}

function Mini({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-surface2 px-2 py-1.5 text-center">
      <p className="text-[9.5px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`text-[13px] font-bold text-tabular ${tone || 'text-ink'}`}>{value}</p>
    </div>
  )
}

function CampaignModal({ onClose, onCreate }) {
  const [draft, setDraft] = useState({ name: '', discountType: 'percent', discountValue: 20, budget: 10000, scheduleNow: true })
  return (
    <Modal
      open
      onClose={onClose}
      title="New campaign"
      description="Discount program with a redemption budget"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={Megaphone} onClick={() => onCreate(draft)}>{draft.scheduleNow ? 'Launch now' : 'Save draft'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Campaign name" required>
          <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Summer Beach Bonus" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount type">
            <select value={draft.discountType} onChange={(e) => setDraft((d) => ({ ...d, discountType: e.target.value }))} className="focus-ring h-9.5 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink">
              <option value="percent">Percent off</option>
              <option value="flat">Flat AFN off</option>
            </select>
          </Field>
          <Field label="Value">
            <Input type="number" min={1} value={draft.discountValue} onChange={(e) => setDraft((d) => ({ ...d, discountValue: Number(e.target.value) }))} />
          </Field>
        </div>
        <Field label="Promotion budget (AFN)">
          <Input type="number" min={100} step={500} value={draft.budget} onChange={(e) => setDraft((d) => ({ ...d, budget: Number(e.target.value) }))} />
        </Field>
        <label className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px] font-medium text-ink">
          Launch immediately
          <input type="checkbox" checked={draft.scheduleNow} onChange={(e) => setDraft((d) => ({ ...d, scheduleNow: e.target.checked }))} className="h-4 w-4 accent-[#1aa28f]" />
        </label>
        <p className="text-xs text-ink-soft">Auto-generated coupon code like <span className="font-mono text-ink">{draft.name.slice(0, 4).toUpperCase() || 'CODE'}20</span> will be deliverable to eligible riders.</p>
      </div>
    </Modal>
  )
}