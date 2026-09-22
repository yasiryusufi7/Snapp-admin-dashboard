import { useState } from 'react'
import { ArrowDownToLine, BarChart3, Download, FileDown, FileSpreadsheet, Files, Loader2, RefreshCcw, Table2, Users2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { exportService } from '../../services/exportService'
import { timeAgo } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'
import { STATUS } from '../../utils/constants'

const ICONS = { csv: FileSpreadsheet, xlsx: FileSpreadsheet, pdf: FileDown }
const KIND_TONE = {
  trips: 'brand',
  drivers: 'blue',
  passengers: 'violet',
  revenue: 'green',
  settlements: 'amber',
  complaints: 'red',
  payments: 'blue',
  analytics: 'violet',
  campaigns: 'amber',
}

export default function ExportCenterPage() {
  const guard = usePageGuard('exports')
  if (guard) return guard

  const { toast } = useToast()
  const [req, setReq] = useState(false)
  const { data: rows, loading, mutate } = useAsync(() => exportService.list(), [])

  const statusCount = (s) => (rows || []).filter((e) => e.status === s).length

  const create = async (draft) => {
    await exportService.requestExport(draft)
    mutate()
    setReq(false)
    toast({ title: 'Export queued', description: `${draft.name || 'Untitled export'} is building and will email when ready.`, tone: 'success' })
  }

  const rerun = async (e) => {
    await exportService.requestExport({ name: `${e.name} (rerun)`, kind: e.kind, format: e.format })
    mutate()
    toast({ title: 'Re-export queued', description: `${e.name} was re-submitted.`, tone: 'info' })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Export Center"
        description="Build, schedule and download curated datasets from the warehouse."
        actions={<Button icon={ArrowDownToLine} onClick={() => setReq(true)}>Request export</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Processing now', value: statusCount('processing'), icon: Loader2, tone: 'text-amber-600 dark:text-amber-300' },
          { label: 'Ready this week', value: statusCount('completed'), icon: FileDown, tone: 'text-emerald-600 dark:text-emerald-300' },
          { label: 'Failed', value: statusCount('failed'), icon: RefreshCcw, tone: 'text-red-600' },
          { label: 'Queued', value: statusCount('queued'), icon: Files, tone: 'text-blue-600 dark:text-blue-300' },
        ].map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-3 px-4 py-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface3 ${s.tone}`}><s.icon className="h-4 w-4" /></span>
            <div>
              <p className="text-[11px] text-ink-faint">{s.label}</p>
              <p className="text-lg font-bold text-ink text-tabular">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Export history" description="All warehouse pulls, newest first" actions={<Badge tone="slate">{rows?.length || 0} exports</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-2.5 font-semibold">Export</th>
                <th className="px-3 py-2.5 font-semibold">Format</th>
                <th className="px-3 py-2.5 text-right font-semibold">Rows</th>
                <th className="px-3 py-2.5 text-right font-semibold">Size</th>
                <th className="px-3 py-2.5 font-semibold">Requested by</th>
                <th className="px-3 py-2.5 font-semibold">Created</th>
                <th className="px-3 py-2.5 text-right font-semibold">Status</th>
                <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {(rows || []).map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-surface2/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface3 text-ink-soft"><Table2 className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{e.name}</p>
                        <p className="font-mono text-[10.5px] text-ink-faint">{e.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge tone={KIND_TONE[e.kind]}>{e.format}</Badge></td>
                  <td className="px-3 py-3 text-right text-ink-soft text-tabular">{e.rows.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-ink-soft">{e.size}</td>
                  <td className="px-3 py-3 text-ink-soft">{e.requestedBy}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ink-faint text-tabular">{timeAgo(e.date)}</td>
                  <td className="px-3 py-3 text-right"><StatusBadge status={STATUS.export[e.status]} size="sm" /></td>
                  <td className="px-5 py-3 text-right">
                    {e.status === 'completed' ? (
                      <Button size="xs" variant="secondary" icon={Download} onClick={() => toast({ title: 'Download started', description: `${e.name}.${e.format.toLowerCase()} downloading — 1 left in this session.`, tone: 'success' })}>Download</Button>
                    ) : (
                      <Button size="xs" variant="ghost" icon={RefreshCcw} onClick={() => rerun(e)}>Re-run</Button>
                    )}
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-ink-faint">Loading exports…</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {req && <ExportModal onClose={() => setReq(false)} onCreate={create} />}
    </div>
  )
}

const KINDS = [
  { key: 'trips', label: 'Trips', icon: BarChart3, desc: 'All ride events with fares' },
  { key: 'drivers', label: 'Drivers', icon: Users2, desc: 'Fleet & performance records' },
  { key: 'payments', label: 'Payments', icon: FileSpreadsheet, desc: 'Ledger + settlements' },
  { key: 'revenue', label: 'Revenue', icon: BarChart3, desc: 'Daily revenue by city' },
  { key: 'complaints', label: 'Complaints', icon: FileDown, desc: 'Trust & safety tickets' },
  { key: 'settlements', label: 'Settlements', icon: FileSpreadsheet, desc: 'Wallet & payout activity' },
]

function ExportModal({ onClose, onCreate }) {
  const [draft, setDraft] = useState({ name: '', kind: 'trips', format: 'xlsx' })
  return (
    <Modal
      open
      onClose={onClose}
      title="Request export"
      description="Pull a dataset from the warehouse and deliver by email"
      footer={<Button icon={Download} onClick={() => onCreate(draft)}>Queue export</Button>}
    >
      <div className="space-y-4">
        <Field label="Export name">
          <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Trips — September pulls" />
        </Field>
        <Field label="Dataset">
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.key}
                onClick={() => setDraft((d) => ({ ...d, kind: k.key }))}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${draft.kind === k.key ? 'border-brand-500 bg-brand-500/5' : 'border-line hover:border-line-strong'}`}
              >
                <k.icon className={`h-4 w-4 shrink-0 ${draft.kind === k.key ? 'text-brand-600 dark:text-brand-300' : 'text-ink-faint'}`} />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{k.label}</p>
                  <p className="truncate text-[10.5px] text-ink-faint">{k.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Format">
          <div className="flex gap-2">
            {['xlsx', 'csv', 'pdf'].map((f) => {
              const FormatIcon = ICONS[f]
              return (
                <button
                  key={f}
                  onClick={() => setDraft((d) => ({ ...d, format: f }))}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold uppercase transition ${draft.format === f ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-200' : 'border-line text-ink-soft hover:border-line-strong'}`}
                >
                  <FormatIcon className="h-4 w-4" /> {f}
                </button>
              )
            })}
          </div>
        </Field>
        <p className="text-xs text-ink-soft">Delivers to <span className="font-semibold text-ink">ops@takviya.io</span> within ~15 minutes. Scheduled exports arrive on the cadence set in Reports.</p>
      </div>
    </Modal>
  )
}