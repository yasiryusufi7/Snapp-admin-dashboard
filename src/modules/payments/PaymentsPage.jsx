import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Landmark, MoreHorizontal, Wallet as WalletIcon } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { paymentService } from '../../services/paymentService'
import { db } from '../../data/db'
import { fmtCurrency, fmtDateTime, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { PageHeader } from '../../components/navigation/PageHeader'
import { StatCard } from '../../components/charts/StatCard'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { DataTable } from '../../components/tables/DataTable'
import { Pagination } from '../../components/tables/Pagination'
import { SearchInput } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton } from '../../components/ui/Button'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { Drawer } from '../../components/ui/Drawer'
import { usePageGuard } from '../../components/common/PageGuard'
import { MiniSparkline } from '../../components/charts/MiniChart'

const createFilters = () => ({ status: undefined, method: undefined, city: undefined })

export default function PaymentsPage() {
  const guard = usePageGuard('payments')
  if (guard) return guard

  const state = useListState({ defaultSort: 'createdAt', defaultDir: 'desc' })
  const [filters, setFilters] = useState(createFilters)
  const [selected, setSelected] = useState(null)

  const { data, loading } = useAsync(
    () => paymentService.list({ ...state.params, filters: { ...state.filters, ...filters } }),
    [state.params, filters],
  )

  const all = db.payments
  const total = all.reduce((s, p) => s + p.amount, 0)
  const commission = all.reduce((s, p) => s + p.commission, 0)
  const fees = all.reduce((s, p) => s + p.fee, 0)
  const byMethod = useMemo(() => {
    const m = {}
    for (const p of all) m[p.method] = (m[p.method] || 0) + p.amount
    return m
  }, [])

  const columns = [
    { key: 'id', label: 'Transaction', render: (p) => <span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-200">{p.id}</span> },
    { key: 'ref', label: 'Ref', render: (p) => <span className="font-mono text-[11px] text-ink-faint">{p.ref}</span> },
    { key: 'user', label: 'Payer', render: (p) => <span className="text-ink-soft">{p.userName}</span> },
    { key: 'trip', label: 'Trip', render: (p) => <span className="font-mono text-xs text-ink-soft">{p.tripId}</span> },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right', tabular: true, render: (p) => <span className="font-semibold text-ink">{fmtCurrency(p.amount, { compact: true })}</span> },
    { key: 'commission', label: 'Commission', align: 'right', tabular: true, render: (p) => <span className="text-ink-soft">{fmtCurrency(p.commission, { compact: true })}</span> },
    { key: 'fee', label: 'Fee', align: 'right', tabular: true, render: (p) => <span className="text-ink-faint">{fmtCurrency(p.fee, { compact: true })}</span> }, // eslint-disable-line no-magic-numbers
    { key: 'method', label: 'Method', render: (p) => <MethodPill method={p.method} /> },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={STATUS.payment[p.status]} size="sm" /> },
    { key: 'when', label: 'Created', align: 'right', render: (p) => <span className="whitespace-nowrap text-xs text-ink-faint text-tabular">{fmtDateTime(p.createdAt)}</span> },
    { key: 'actions', label: '', align: 'right', render: (p) => (
      <Menu label="Payment actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
        <MenuItem icon={CreditCard} onClick={() => setSelected(p)}>View transaction</MenuItem>
        {p.status === 'completed' && <MenuItem icon={ArrowDownLeft} onClick={() => setSelected(p)}>Mark refund</MenuItem>}
      </Menu>
    ) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Payments" description="Cash flows, transaction ledger and payment-method breakdown across the network." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total processed" value={fmtCurrency(total, { compact: true })} trend={{ up: 14.2 }} icon={WalletIcon} hint="Visible dataset" />
        <StatCard label="Commission collected" value={fmtCurrency(commission, { compact: true })} trend={{ up: 9.1 }} icon={ArrowUpRight} hint={`${((commission / total) * 100).toFixed(1)}% take rate`} />
        <StatCard label="Processing fees" value={fmtCurrency(fees, { compact: true })} hint="2.9% + psp" icon={Landmark} />
        <StatCard label="Transactions" value={String(all.length)} icon={CreditCard} hint={`${Object.keys(byMethod).length} methods`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Volume by payment method" description="Share of processed value" />
          <CardBody className="p-5">
            <div className="space-y-3">
              {['credit', 'wallet', 'cash', 'corporate'].filter((m) => byMethod[m]).map((m) => {
                const v = byMethod[m]
                const pct = (v / total) * 100
                const color = { credit: '#6366f1', wallet: '#14b8a6', cash: '#f59e0b', corporate: '#8b5cf6' }[m]
                return (
                  <div key={m}>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="capitalize text-ink-soft">{m}</span>
                      <span className="font-semibold text-ink text-tabular">{fmtCurrency(v, { compact: true })} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface3">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Daily captured" description="Trend of the last 10 days" />
          <CardBody className="p-5">
            <MiniSparkline data={db.series.revenueByCity.map((c) => c.value).slice(0, 10)} color="#14b8a6" height={96} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Object.entries(byMethod).map(([m, v]) => (
                <div key={m} className="rounded-lg border border-line px-3 py-2">
                  <p className="text-[10.5px] uppercase tracking-wide text-ink-faint">{m}</p>
                  <p className="text-sm font-bold text-ink text-tabular">{fmtCurrency(v, { compact: true })}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search ID, ref, payer…" className="w-64" />
        <FilterSelect label="Method" value={filters.method} onChange={(v) => setFilters((f) => ({ ...f, method: v }))} placeholder="All methods" options={[{ value: 'credit', label: 'Card' }, { value: 'wallet', label: 'Wallet' }, { value: 'cash', label: 'Cash' }, { value: 'corporate', label: 'Corporate' }]} />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={Object.entries(STATUS.payment).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="City" value={filters.city} onChange={(v) => setFilters((f) => ({ ...f, city: v }))} placeholder="All cities" options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Mazar-e-Sharif', label: 'Mazar-e-Sharif' }, { value: 'Herat', label: 'Herat' }, { value: 'Kandahar', label: 'Kandahar' }, { value: 'Jalalabad', label: 'Jalalabad' }]} />
      </FilterBar>

      <div className="card-surface overflow-hidden">
        <DataTable columns={columns} rows={data?.items || []} rowKey="id" loading={loading} sort={state.sort} dir={state.dir} onSort={state.onSort} onRowClick={(p) => setSelected(p)} />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>

      {selected && <PaymentDrawer payment={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

export function MethodPill({ method }) {
  const tone = { credit: 'blue', wallet: 'teal', cash: 'amber', corporate: 'violet' }[method] || 'slate'
  return <Badge tone={tone}>{method}</Badge>
}

function PaymentDrawer({ payment, onClose }) {
  return (
    <Drawer open onClose={onClose} title={payment.id} description={`${payment.ref} · ${fmtDateTime(payment.createdAt)}`} width="w-[26rem]">
      <div className="rounded-xl border border-line p-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">Captured amount</p>
        <p className="mt-1 text-2xl font-bold text-ink text-tabular">{fmtCurrency(payment.amount)}</p>
        <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
          <span className="flex justify-between text-ink-soft"><span>Commission</span><span className="font-semibold text-ink text-tabular">− {fmtCurrency(payment.commission)}</span></span>
          <span className="flex justify-between text-ink-soft"><span>Processing fee</span><span className="font-semibold text-ink text-tabular">− {fmtCurrency(payment.fee)}</span></span>
          <span className="flex justify-between text-ink-soft"><span>Driver settlement</span><span className="font-semibold text-emerald-600 text-tabular">+ {fmtCurrency(payment.amount - payment.commission - payment.fee)}</span></span>
        </div>
      </div>

      <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Details</p>
      <div className="space-y-2">
        <Detail label="Trip" value={payment.tripId} />
        <Detail label="Payer" value={payment.userName} />
        <Detail label="Method" value={payment.method} />
        <Detail label="City" value={payment.city} />
        <Detail label="Status" value={payment.status} />
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-500/8 px-3 py-2.5">
        <ArrowDownLeft className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <p className="text-xs leading-relaxed text-ink-soft">Settlement is queued to the driver wallet. Full payout cycles run every Monday and Thursday.</p>
      </div>
    </Drawer>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[13px]">
      <span className="text-ink-soft">{label}</span>
      <span className="font-mono text-xs font-medium text-ink">{value}</span>
    </div>
  )
}