import { useState } from 'react'
import { Banknote, Ban, History, Landmark, Wallet as WalletIcon } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { walletService } from '../../services/walletService'
import { db } from '../../data/db'
import { fmtCurrency, fmtNumber, fmtDateTime } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { StatCard } from '../../components/charts/StatCard'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { SearchInput } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Drawer } from '../../components/ui/Drawer'
import { usePageGuard } from '../../components/common/PageGuard'

export default function WalletPage() {
  const guard = usePageGuard('wallet')
  if (guard) return guard

  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [run, setRun] = useState(false)

  const { data: summary } = useAsync(() => walletService.summary(), [])
  const { data: rows, loading, mutate } = useAsync(() => walletService.list({ search, status: filter === 'all' ? undefined : filter }), [search, filter])

  const toggleHold = async (s) => {
    const next = s.held ? null : `${s.driverId.slice(-5)}-HLD`
    await walletService.hold(s.driverId, !!next)
    mutate((prev) => prev.map((x) => (x.driverId === s.driverId ? { ...x, held: next } : x)))
    toast({ title: next ? 'Settlement held' : 'Hold released', description: `${s.driver}'s payout was ${next ? 'blocked pending review' : 'released back to the queue'}.`, tone: next ? 'warning' : 'success' })
  }

  const payNow = async (s) => {
    await walletService.payNow(s.driverId)
    mutate((prev) => prev.map((x) => (x.driverId === s.driverId ? { ...x, pending: 0, settled: x.settled + x.pending, withdrawals: x.withdrawals + 1 } : x)))
    toast({ title: 'Instant payout sent', description: `${fmtCurrency(s.pending)} paid to ${s.driver} (manual out-of-cycle).`, tone: 'success' })
  }

  const startRun = () => {
    setRun(false)
    toast({ title: 'Payout run scheduled', description: 'Batch for all unsettled drivers will execute during the next cycle window.', tone: 'success' })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Wallet & Settlements"
        description="Driver earnings wallets, payout holds and settlement runs."
        actions={<Button icon={Landmark} onClick={() => setRun(true)}>Run payout cycle</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending payout pool" value={fmtCurrency(summary?.totalPayable, { compact: true })} icon={Banknote} tone="amber" hint="To settle this cycle" />
        <StatCard label="Settled lifetime" value={fmtCurrency(summary?.totalSettled, { compact: true })} icon={Landmark} tone="green" hint="Net of commission" />
        <StatCard label="Drivers with balance" value={fmtNumber(summary?.pendingCount, { compact: true })} icon={WalletIcon} hint={`of ${summary?.drivers} partners`} />
        <StatCard label="Next cycle" value="Thu 03:00" icon={History} hint="Bi-weekly sweep" />
      </div>

      <Card>
        <CardHeader
          title="Settlement queue"
          description="Drivers ordered by pending balance"
          actions={
            <div className="flex items-center gap-2">
              <SearchInput value={search} onChange={setSearch} placeholder="Search driver…" className="w-56" />
              {[['all', 'All'], ['pending', 'Pending'], ['settled', 'Settled']].map(([k, v]) => (
                <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${filter === k ? 'bg-brand-600 text-white' : 'bg-surface2 text-ink-soft hover:text-ink'}`}>{v}</button>
              ))}
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-2.5 font-semibold">Driver</th>
                <th className="px-3 py-2.5 text-right font-semibold">Wallet</th>
                <th className="px-3 py-2.5 text-right font-semibold">Earnings</th>
                <th className="px-3 py-2.5 text-right font-semibold">Commission</th>
                <th className="px-3 py-2.5 text-right font-semibold">Pending</th>
                <th className="px-3 py-2.5 text-right font-semibold">Withdrawals</th>
                <th className="px-3 py-2.5 font-semibold">Settled</th>
                <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {(rows || []).map((s) => {
                const settledPct = Math.round((s.settled / Math.max(s.earnings, 1)) * 100)
                return (
                  <tr key={s.driverId} className="transition-colors hover:bg-surface2/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{s.driver}</p>
                      <p className="font-mono text-[10.5px] text-ink-faint">{s.driverId}</p>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-ink text-tabular">{fmtCurrency(s.wallet, { compact: true })}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{fmtCurrency(s.earnings, { compact: true })}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">− {fmtCurrency(s.commission, { compact: true })}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-semibold text-tabular ${s.held ? 'text-amber-600 dark:text-amber-300' : s.pending > 0 ? 'text-ink' : 'text-ink-faint'}`}>
                        {s.held ? `Held · ${fmtCurrency(s.pending, { compact: true })}` : fmtCurrency(s.pending, { compact: true })}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{s.withdrawals}</td>
                    <td className="px-3 py-3">
                      <div className="flex w-24 flex-col items-end gap-1">
                        <ProgressBar value={settledPct} size="xs" tone={settledPct > 85 ? 'green' : 'amber'} />
                        <span className="text-[10.5px] text-ink-faint text-tabular">{settledPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.pending > 0 && !s.held && (
                          <Button size="xs" variant="secondary" icon={Banknote} onClick={() => payNow(s)}>Pay</Button>
                        )}
                        <Button size="xs" variant={s.held ? 'primary' : 'ghost'} icon={Ban} onClick={() => toggleHold(s)}>{s.held ? 'Release' : 'Hold'}</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && rows?.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-ink-faint">No settlement rows for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PayoutDrawer open={run} onClose={() => setRun(false)} onRun={startRun} payable={summary?.totalPayable || 0} count={summary?.pendingCount || 0} />
    </div>
  )
}

function PayoutDrawer({ open, onClose, onRun, payable, count }) {
  const lastRun = db.exports?.[0]
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Run payout cycle"
      description="Batch settlement to driver wallets"
      footer={<Button onClick={onRun}>Schedule payout run</Button>}
    >
      <div className="rounded-xl border border-line p-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">This cycle</p>
        <p className="mt-1 text-2xl font-bold text-ink text-tabular">{fmtCurrency(payable)}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{count} drivers with pending balance</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px]">
          <span className="text-ink-soft">Execution window</span>
          <span className="font-semibold text-ink">Thursday · 03:00</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px]">
          <span className="text-ink-soft">Settlement schedule</span>
          <span className="font-semibold text-ink">Bi-weekly (Mon + Thu)</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px]">
          <span className="text-ink-soft">Transfer method</span>
          <span className="font-semibold text-ink">Bank transfer (ACH)</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-[13px]">
          <span className="text-ink-soft">Estimated processing fee</span>
          <span className="font-semibold text-ink text-tabular">{fmtCurrency(payable * 0.004)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-amber-500/8 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-ink-soft">
          Held balances (<span className="font-semibold text-amber-600">Held</span> badges) are excluded from the run. Last successful run: <span className="font-semibold text-ink">{lastRun ? `${lastRun.name}` : '—'} · {lastRun ? fmtDateTime(lastRun.date) : '—'}</span>.
        </p>
      </div>
    </Drawer>
  )
}