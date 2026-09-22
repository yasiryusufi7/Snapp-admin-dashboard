import { useState } from 'react'
import { AlertTriangle, HandCoins, History, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../../data/db'
import { fmtDate, fmtPercent } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'

export default function CommissionRulesPage() {
  const guard = usePageGuard('commissions')
  if (guard) return guard

  const { toast } = useToast()
  const [rows, setRows] = useState(db.commissionRules)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const conflict = rows.filter((r) => r.conflict).length > 0
  const now = Date.now()
  const upcoming = rows.filter((r) => r.effectiveFrom > now).length

  const toggle = (r) => {
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: x.status === 'active' ? 'paused' : 'active' } : x)))
    toast({ title: `${r.name} ${r.status === 'active' ? 'paused' : 'activated'}`, tone: r.status === 'active' ? 'warning' : 'success' })
  }

  const remove = (r) => {
    setRows((prev) => prev.filter((x) => x.id !== r.id))
    toast({ title: 'Rule deleted', description: r.name, tone: 'info' })
  }

  const save = (draft) => {
    if (editing) setRows((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...draft } : x)))
    else setRows((prev) => [...prev, { ...draft, id: `COM-${String(rows.length + 6).padStart(3, '0')}`, conflict: false }])
    setEditing(null)
    setCreating(false)
    toast({ title: 'Commission rule saved', tone: 'success' })
  }

  const scopeTone = { global: 'slate', city: 'blue', vehicle: 'green', driver: 'violet' }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Commission Rules"
        description="Take-rate policy engine: global defaults with city, fleet and driver overrides."
        actions={<Button icon={Plus} onClick={() => setCreating(true)}>New rule</Button>}
      />

      {conflict && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-300">Overlapping rules detected</p>
            <p className="text-xs text-ink-soft">“Top earner program” overlaps the global default. Drivers matching multiple scopes are charged the lowest applicable rate. Resolve before the next settlement run.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active rules', value: rows.filter((r) => r.status === 'active').length },
          { label: 'Upcoming', value: upcoming },
          { label: 'Overrides', value: rows.filter((r) => r.scope !== 'global').length },
          { label: 'Default (global)', value: fmtPercent(rows.filter((r) => r.scope === 'global')[0]?.rate * 100 || 0) },
        ].map((s) => (
          <div key={s.label} className="card-surface px-4 py-3">
            <p className="text-[11px] font-medium text-ink-faint">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-ink text-tabular">{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader icon={History} title="Active & scheduled policy" description="Precedence: driver > vehicle > city > global" />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-2.5 font-semibold">Rule</th>
                <th className="px-3 py-2.5 font-semibold">Scope</th>
                <th className="px-3 py-2.5 text-right font-semibold">Rate</th>
                <th className="px-3 py-2.5 font-semibold">Effective window</th>
                <th className="px-3 py-2.5 text-right font-semibold">Status</th>
                <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.map((r) => {
                const nowTs = Date.now()
                const active = r.status === 'active' && r.effectiveFrom <= nowTs && (!r.effectiveUntil || r.effectiveUntil >= nowTs)
                return (
                  <tr key={r.id} className="transition-colors hover:bg-surface2/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{r.name}</p>
                      <p className="font-mono text-[10.5px] text-ink-faint">{r.id}</p>
                    </td>
                    <td className="px-3 py-3"><Badge tone={scopeTone[r.scope]}>{r.scopeLabel}</Badge></td>
                    <td className="px-3 py-3 text-right"><span className="text-base font-bold text-ink text-tabular">{fmtPercent(r.rate * 100)}</span></td>
                    <td className="px-3 py-3">
                      <p className="whitespace-nowrap text-xs font-medium text-ink-soft text-tabular">{fmtDate(r.effectiveFrom)}{r.effectiveUntil ? ` → ${fmtDate(r.effectiveUntil)}` : ' → ∞'}</p>
                      {r.effectiveUntil && <p className="text-[10.5px] text-ink-faint">ends {fmtDate(r.effectiveUntil)}</p>}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {r.conflict && <Badge tone="amber">conflict</Badge>}
                        <Badge tone={active ? 'green' : 'slate'}>{active ? 'active' : r.status}</Badge>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Menu label="Rule actions" trigger={<IconButton label="Row actions" icon={Pencil} size="sm" />}>
                        <MenuItem icon={Pencil} onClick={() => setEditing(r)}>Edit rule</MenuItem>
                        <MenuItem icon={History} onClick={() => toggle(r)}>{r.status === 'active' ? 'Pause' : 'Activate'}</MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => remove(r)}>Delete</MenuItem>
                      </Menu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {(editing || creating) && (
        <RuleModal rule={editing} onClose={() => { setEditing(null); setCreating(false) }} onSave={save} />
      )}
    </div>
  )
}

const SCOPES = [
  { value: 'global', label: 'Global · all cities & drivers' },
  { value: 'city', label: 'City · single city' },
  { value: 'vehicle', label: 'Vehicle type · e.g. Electric' },
  { value: 'driver', label: 'Driver group · e.g. Top earners' },
]

function RuleModal({ rule, onClose, onSave }) {
  const [draft, setDraft] = useState({
    name: rule?.name || '',
    scope: rule?.scope || 'global',
    scopeLabel: rule?.scopeLabel || SCOPES[0].label,
    rate: rule ? rule.rate * 100 : 16,
  })

  return (
    <Modal open onClose={onClose} title={rule ? 'Edit commission rule' : 'New commission rule'} footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button icon={HandCoins} onClick={() => onSave({ ...draft, rate: draft.rate / 100 })}>Save rule</Button>
      </>
    }>
      <div className="space-y-4">
        <Field label="Rule name">
          <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Herat winter incentive" />
        </Field>
        <Field label="Scope">
          <select value={draft.scope} onChange={(e) => {
            const s = SCOPES.find((x) => x.value === e.target.value)
            setDraft((d) => ({ ...d, scope: e.target.value, scopeLabel: s.label }))
          }} className="focus-ring h-9.5 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink">
            {SCOPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rate (%)">
            <Input type="number" min={0} max={40} step={0.5} value={draft.rate} onChange={(e) => setDraft((d) => ({ ...d, rate: Number(e.target.value) }))} />
          </Field>
          <div className="rounded-lg border border-line bg-surface2/60 px-3 py-3">
            <p className="text-[11px] text-ink-faint">Driver take</p>
            <p className="text-lg font-bold text-ink text-tabular">{fmtPercent(100 - draft.rate)}</p>
          </div>
        </div>
        <div className="rounded-lg bg-brand-500/5 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
          Rates are applied at settlement time. When multiple rules match a driver, the <span className="font-semibold text-ink">lowest rate wins</span>.
        </div>
      </div>
    </Modal>
  )
}