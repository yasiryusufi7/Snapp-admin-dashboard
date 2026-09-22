import { useState } from 'react'
import { BarChart3, CalendarRange, Download, FileSpreadsheet, FileText, Repeat2, Users2, Wallet } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { exportService } from '../../services/exportService'
import { reportService } from '../../services/reportService'
import { fmtCurrency, fmtDate, timeAgo } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { usePageGuard } from '../../components/common/PageGuard'
import { ProgressBar } from '../../components/ui/ProgressBar'

const REPORTS = [
  {
    key: 'trips',
    name: 'Trip volume & revenue',
    desc: 'Hourly demand, completion rate and ARPU with city splits.',
    icon: BarChart3,
    tone: 'text-brand-600 dark:text-brand-300',
    schedule: 'Daily 06:00',
    source: 'datawarehouse.trips',
    lastRun: 'today 05:59',
    rows: '1.2M rows',
  },
  {
    key: 'drivers',
    name: 'Driver performance',
    desc: 'Acceptance, cancellation, rating and hourly earnings per partner.',
    icon: Users2,
    tone: 'text-blue-600 dark:text-blue-300',
    schedule: 'Week 3 (Mon)',
    source: 'datawarehouse.drivers',
    lastRun: 'Mon 06:00',
    rows: '9.4K rows',
  },
  {
    key: 'payments',
    name: 'Payments reconciliation',
    desc: 'Settled vs pending, refunds, PSP fees and take-rate drill-down.',
    icon: Wallet,
    tone: 'text-violet-600 dark:text-violet-300',
    schedule: 'Bi-weekly (Mon/Thu)',
    source: 'datawarehouse.settlements',
    lastRun: 'Thu 03:10',
    rows: '386K rows',
  },
  {
    key: 'complaints',
    name: 'Trust & safety',
    desc: 'Complaint mix, SLA coverage and repeat-offender analysis.',
    icon: FileText,
    tone: 'text-amber-600 dark:text-amber-300',
    schedule: 'On demand',
    source: 'datawarehouse.complaints',
    lastRun: 'yesterday',
    rows: '14.8K rows',
  },
]

export default function ReportsPage() {
  const guard = usePageGuard('reports')
  if (guard) return guard

  const { toast } = useToast()
  const [active, setActive] = useState('trips')

  const { data: exports } = useAsync(() => exportService.list(), [])
  const { data: preview } = useAsync(() => reportService.preview(active), [active])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Reports"
        description="Curated analytics packs with scheduled delivery into the export pipeline."
        actions={<Button icon={Download} onClick={() => toast({ title: 'Export wizard', description: 'Use the Export Center for ad-hoc pulls.', tone: 'info' })}>Ad-hoc export</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className={`rounded-xl border p-4 text-left transition ${active === r.key ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/40' : 'border-line bg-surface hover:border-line-strong'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface3 ${r.tone}`}><r.icon className="h-4.5 w-4.5" /></span>
              <Badge tone={active === r.key ? 'brand' : 'slate'}>{r.schedule}</Badge>
            </div>
            <p className="mt-3 text-sm font-bold text-ink">{r.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{r.desc}</p>
            <p className="mt-2.5 font-mono text-[10.5px] text-ink-faint">{r.source}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={REPORTS.find((r) => r.key === active)?.name}
            description={`Latest snapshot · ${REPORTS.find((r) => r.key === active)?.lastRun}`}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={Repeat2} onClick={() => toast({ title: 'Schedule updated', description: 'Delivery cadence changed.', tone: 'success' })}>Schedule</Button>
                <Button size="sm" icon={Download} onClick={() => toast({ title: 'Download started', description: `Exporting ${active} report…`, tone: 'info' })}>Download</Button>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-semibold">#</th>
                  <th className="px-3 py-2.5 font-semibold">Series</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Value</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Δ vs prior</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {(preview || []).map((p, i) => (
                  <tr key={p.name} className="transition-colors hover:bg-surface2/40">
                    <td className="px-5 py-2.5 text-ink-faint text-tabular">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-3 py-2.5 font-medium capitalize text-ink">{p.name}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-ink text-tabular">{p.value}</td>
                    <td className="px-3 py-2.5 text-right text-tabular">
                      <span className={p.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}>{p.delta >= 0 ? '+' : ''}{p.delta}%</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="ml-auto flex w-24 items-center gap-2">
                        <ProgressBar value={p.share} size="xs" tone="brand" />
                        <span className="w-9 text-right text-[11px] text-ink-faint text-tabular">{p.share}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent exports */}
        <Card>
          <CardHeader icon={FileSpreadsheet} title="Recent exports" description="Pulled from the pipeline" />
          <div className="divide-y divide-line/70">
            {(exports || []).slice(0, 7).map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-2.5">
                <FileText className="h-4 w-4 shrink-0 text-ink-faint" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{e.name}</p>
                  <p className="text-[11px] text-ink-faint">{e.format} · {e.rows.toLocaleString()} rows · {timeAgo(e.date)}</p>
                </div>
                <Badge tone={e.status === 'processing' ? 'amber' : e.status === 'failed' ? 'red' : e.status === 'queued' ? 'slate' : 'green'}>{e.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: CalendarRange, label: 'Next scheduled run', value: 'Today 06:00 → 06:14' },
          { icon: Repeat2, label: 'Automated deliveries', value: '14 pipelines' },
          { icon: Download, label: 'Exports this week', value: '23 files · 812 MB' },
          { icon: FileSpreadsheet, label: 'Freshness SLA', value: '99.4% on-time' },
        ].map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface3 text-ink-soft"><s.icon className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="text-[11px] text-ink-faint">{s.label}</p>
              <p className="truncate text-[13px] font-bold text-ink">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}