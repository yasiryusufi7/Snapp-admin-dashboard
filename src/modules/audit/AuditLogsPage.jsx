import { useMemo, useState } from 'react'
import { Activity, Eye, MonitorSmartphone, RefreshCcw } from 'lucide-react'
import { db } from '../../data/db'
import { fmtDateTime, timeAgo } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SearchInput } from '../../components/ui/Input'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { usePageGuard } from '../../components/common/PageGuard'

const OUTCOME_TONE = { success: 'green', denied: 'red', error: 'amber' }

export default function AuditLogsPage() {
  const guard = usePageGuard('auditLogs')
  if (guard) return guard

  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [module, setModule] = useState(undefined)
  const [outcome, setOutcome] = useState(undefined)
  const [actor, setActor] = useState(undefined)

  const rows = useMemo(() => {
    let r = db.audit
    const q = search.toLowerCase()
    if (q) r = r.filter((x) => (x.actor + x.action + x.module + x.resource).toLowerCase().includes(q))
    if (module) r = r.filter((x) => x.module === module)
    if (outcome) r = r.filter((x) => x.outcome === outcome)
    if (actor) r = r.filter((x) => x.actor === actor)
    return r
  }, [search, module, outcome, actor])

  const actors = [...new Set(db.audit.map((x) => x.actor))]
  const modules = [...new Set(db.audit.map((x) => x.module))].filter(Boolean)
  const denied = db.audit.filter((x) => x.outcome === 'denied').length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit Logs"
        description="Immutable trail of administrative actions across the platform."
        actions={<Button variant="secondary" icon={MonitorSmartphone} onClick={() => toast({ title: 'Session audit', description: 'Showing 14d of history for this workspace.', tone: 'info' })}>Session context</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Events (14d)', value: String(db.audit.length), icon: Activity },
          { label: 'Denied attempts', value: String(denied), icon: Eye, tone: 'text-red-600' },
          { label: 'Unique actors', value: String(actors.length + 1), icon: MonitorSmartphone },
          { label: 'Retention', value: '180 days', icon: RefreshCcw },
        ].map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-3 px-4 py-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface3 text-ink-soft ${s.tone || ''}`}><s.icon className="h-4 w-4" /></span>
            <div>
              <p className="text-[11px] text-ink-faint">{s.label}</p>
              <p className="text-lg font-bold text-ink text-tabular">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <FilterBar
        onClear={() => { setSearch(''); setModule(undefined); setOutcome(undefined); setActor(undefined) }}
        dirty={Boolean(search || module || outcome || actor)}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search actor, action, resource…" className="w-64" />
        <FilterSelect label="Module" value={module} onChange={setModule} placeholder="All modules" options={modules.map((m) => ({ value: m, label: m }))} />
        <FilterSelect label="Outcome" value={outcome} onChange={setOutcome} placeholder="All outcomes" options={Object.keys(OUTCOME_TONE).map((k) => ({ value: k, label: k }))} />
        <FilterSelect label="Actor" value={actor} onChange={setActor} placeholder="All actors" options={actors.map((a) => ({ value: a, label: a }))} />
      </FilterBar>

      <Card>
        <CardHeader title="Activity trail" description={`${rows.length} events match`} actions={<Badge tone="slate">read-only ledger</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-2.5 font-semibold">When</th>
                <th className="px-3 py-2.5 font-semibold">Actor</th>
                <th className="px-3 py-2.5 font-semibold">Action</th>
                <th className="px-3 py-2.5 font-semibold">Resource</th>
                <th className="px-3 py-2.5 font-semibold">Module</th>
                <th className="px-3 py-2.5 font-semibold">IP</th>
                <th className="px-5 py-2.5 text-right font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.map((x) => (
                <tr key={x.id} className="transition-colors hover:bg-surface2/40">
                  <td className="px-5 py-2.5">
                    <p className="text-xs font-medium text-ink text-tabular">{timeAgo(x.ts)}</p>
                    <p className="font-mono text-[10.5px] text-ink-faint text-tabular">{fmtDateTime(x.ts)}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-ink">{x.actor}</p>
                    <p className="text-[10.5px] uppercase tracking-wide text-ink-faint">{x.role.replace('_', ' ')}</p>
                  </td>
                  <td className="px-3 py-2.5"><span className="inline-flex rounded-md bg-surface3 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-200">{x.action}</span></td>
                  <td className="px-3 py-2.5 font-mono text-xs text-ink-soft">{x.resource}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{x.module}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink-faint">{x.ip}</td>
                  <td className="px-5 py-2.5 text-right"><Badge tone={OUTCOME_TONE[x.outcome]}>{x.outcome}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}