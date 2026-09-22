import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CarFront, Eye, MoreHorizontal, ShieldBan, ShieldCheck, ShieldEllipsis } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { driverService } from '../../services/driverService'
import { fmtCurrency, fmtNumber, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { DataTable } from '../../components/tables/DataTable'
import { Pagination } from '../../components/tables/Pagination'
import { SearchInput } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Rating } from '../../components/ui/Rating'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton, Button } from '../../components/ui/Button'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { Drawer } from '../../components/ui/Drawer'
import { usePageGuard } from '../../components/common/PageGuard'

const createFilters = () => ({ verification: undefined, status: undefined, city: undefined, vehicleType: undefined })

export default function DriversPage() {
  const guard = usePageGuard('drivers')
  if (guard) return guard

  const navigate = useNavigate()
  const { toast } = useToast()
  const state = useListState({ defaultSort: 'joined', defaultDir: 'desc' })
  const [filters, setFilters] = useState(createFilters)
  const [reviewing, setReviewing] = useState(null)

  const { data, loading, mutate } = useAsync(
    () => driverService.list({ ...state.params, filters: { ...state.filters, ...filters } }),
    [state.params, filters],
  )

  const pendingCount = useMemo(
    () => data?.items.filter((d) => d.verification === 'pending' || d.verification === 'review').length || 0,
    [data],
  )

  const setStatus = async (d, status) => {
    await driverService.setStatus(d.id, status)
    state.reload()
    toast({ title: `${d.name} ${status}`, tone: status === 'suspended' ? 'warning' : 'success' })
  }

  const columns = [
    {
      key: 'driver', label: 'Driver', render: (d) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={d.name} size="sm" status={STATUS.driver[d.status] && d.status !== 'offline' && d.status !== 'suspended' ? d.status : undefined} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{d.name}</p>
            <p className="font-mono text-[11px] text-ink-faint">{d.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (d) => <span className="whitespace-nowrap text-ink-soft text-tabular">{d.phone}</span> },
    {
      key: 'vehicle', label: 'Vehicle', render: (d) => (
        <div className="min-w-0">
          <p className="whitespace-nowrap text-[13px] font-medium text-ink">{d.plate}</p>
          <p className="truncate text-xs text-ink-soft">{d.vehicle?.brand} · {d.vehicleType}</p>
        </div>
      ),
    },
    { key: 'rating', label: 'Rating', sortable: true, render: (d) => <Rating value={d.rating} showValue size={12} /> },
    { key: 'rides', label: 'Trips', sortable: true, align: 'right', tabular: true, render: (d) => <span className="font-medium text-ink">{fmtNumber(d.rides, { compact: true })}</span> },
    { key: 'earnings', label: 'Earnings', sortable: true, align: 'right', tabular: true, render: (d) => <span className="font-medium text-ink">{fmtCurrency(d.earnings, { compact: true })}</span> },
    { key: 'status', label: 'Status', render: (d) => <StatusBadge status={STATUS.driver[d.status]} /> },
    {
      key: 'verification', label: 'Verification', render: (d) => (
        <span className="inline-flex items-center gap-1.5">
          <StatusBadge status={STATUS.verification[d.verification]} size="sm" />
          {(d.verification === 'pending' || d.verification === 'review') && (
            <button onClick={() => setReviewing(d)} className="rounded-md bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-500/10 dark:text-brand-200" role="button">
              Review
            </button>
          )}
        </span>
      ),
    },
    { key: 'lastActive', label: 'Last active', render: (d) => <span className="whitespace-nowrap text-xs text-ink-faint text-tabular">{timeAgo(d.lastActive)}</span> },
    {
      key: 'actions', label: '', align: 'right', render: (d) => (
        <Menu label="Driver actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          <MenuItem icon={Eye} onClick={() => navigate(`/drivers/${d.id}`)}>View profile</MenuItem>
          <MenuItem icon={ShieldEllipsis} onClick={() => setReviewing(d)}>Open verification</MenuItem>
          {d.status === 'suspended' ? (
            <MenuItem icon={ShieldCheck} onClick={() => setStatus(d, 'available')}>Reinstate driver</MenuItem>
          ) : (
            <MenuItem icon={ShieldBan} danger onClick={() => setStatus(d, 'suspended')}>Suspend driver</MenuItem>
          )}
        </Menu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Drivers"
        description="Partner fleet: availability, verification and performance."
        actions={
          pendingCount > 0 ? (
            <Button variant="secondary" icon={ShieldEllipsis} onClick={() => setReviewing(data.items.find((d) => d.verification === 'pending' || d.verification === 'review'))}>
              {pendingCount} need review
            </Button>
          ) : undefined
        }
      />

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search name, ID, plate…" className="w-64" />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={Object.entries(STATUS.driver).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="Verification" value={filters.verification} onChange={(v) => setFilters((f) => ({ ...f, verification: v }))} placeholder="All verification" options={Object.entries(STATUS.verification).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="City" value={filters.city} onChange={(v) => setFilters((f) => ({ ...f, city: v }))} placeholder="All cities" options={['Kabul', 'Mazar-e-Sharif', 'Herat', 'Kandahar', 'Jalalabad'].map((c) => ({ value: c, label: c }))} />
        <FilterSelect label="Vehicle" value={filters.vehicleType} onChange={(v) => setFilters((f) => ({ ...f, vehicleType: v }))} placeholder="All types" options={[{ value: 'economy', label: 'Economy' }, { value: 'executive', label: 'Executive' }, { value: 'xl', label: 'XL' }, { value: 'eco', label: 'Electric' }]} />
      </FilterBar>

      <div className="card-surface overflow-hidden">
        <DataTable
          columns={columns}
          rows={data?.items || []}
          rowKey="id"
          loading={loading}
          sort={state.sort}
          dir={state.dir}
          onSort={state.onSort}
          onRowClick={(d) => navigate(`/drivers/${d.id}`)}
        />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>

      {reviewing && (
        <VerificationDrawer driver={reviewing} onClose={() => setReviewing(null)} onDone={() => { setReviewing(null); state.reload() }} />
      )}
    </div>
  )
}

function VerificationDrawer({ driver, onClose, onDone }) {
  const { toast } = useToast()
  const [status, setStatus] = useState(driver.verification)

  const steps = [
    { key: 'personal', label: 'Personal information', done: true },
    { key: 'documents', label: 'Documents', done: driver.verification !== 'pending' },
    { key: 'vehicle', label: 'Vehicle verification', done: driver.vehicleType != null },
    { key: 'compliance', label: 'Compliance review', done: driver.verification === 'review' || driver.verification === 'verified' },
    { key: 'approval', label: 'Approval', done: driver.verification === 'verified' },
  ]

  const verify = async (docName) => {
    await driverService.updateDocument(driver.id, docName, 'verified')
    toast({ title: `${docName} verified`, tone: 'success' })
  }

  return (
    <Drawer open onClose={onClose} title="Driver verification" description={`${driver.name} · ${driver.id} · ${driver.area}, ${driver.city}`} width="w-[30rem]" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={async () => { await driverService.updateVerification(driver.id, 'all', 'rejected'); onDone(); toast({ title: 'Verification rejected', tone: 'warning' }) }}>Reject</Button>
        <Button onClick={async () => { await driverService.updateVerification(driver.id, 'all', 'verified'); onDone(); toast({ title: 'Driver approved', description: `${driver.name} is now verified and can go online.`, tone: 'success' }) }}>Approve</Button>
      </>
    }>
      <div className="space-y-5">
        {/* Stepper */}
        <ol className="space-y-0">
          {steps.map((s, i) => (
            <li key={s.key} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-px ${s.done ? 'bg-brand-500/50' : 'bg-line'}`} />}
              <span className={`mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold ${s.done ? 'bg-brand-600 text-white' : 'bg-surface3 text-ink-faint'}`}>
                {s.done ? '✓' : i + 1}
              </span>
              <p className={`pt-1 text-[13px] font-medium ${s.done ? 'text-ink' : 'text-ink-faint'}`}>{s.label}</p>
            </li>
          ))}
        </ol>

        <div className="h-px bg-line" />

        {/* Documents */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Vehicle documents</p>
          <div className="overflow-hidden rounded-lg border border-line">
            {driver.vehicle?.documents.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between gap-3 border-b border-line/70 px-3 py-2.5 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-ink">{doc.name}</p>
                  <StatusBadge status={STATUS.verification[doc.status]} size="sm" />
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.status !== 'verified' && (
                    <Button size="xs" variant="secondary" onClick={() => verify(doc.name)}>Verify</Button>
                  )}
                  <Button size="xs" variant="ghost" onClick={() => toast({ title: 'Document preview', description: `${doc.name} opened in viewer.`, tone: 'info' })}>Preview</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance signals */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Compliance signals</p>
          <div className="grid grid-cols-2 gap-2">
            <Signal label="Acceptance rate" value={`${driver.acceptanceRate}%`} tone={driver.acceptanceRate > 85 ? 'green' : 'amber'} />
            <Signal label="Cancellation rate" value={`${((driver.cancelled / Math.max(driver.rides, 1)) * 100).toFixed(1)}%`} tone={driver.cancelled / Math.max(driver.rides, 1) < 0.05 ? 'green' : 'amber'} />
            <Signal label="Rating" value={driver.rating.toFixed(2)} tone={driver.rating > 4.5 ? 'green' : 'amber'} />
            <Signal label="Online hours (30d)" value={`${driver.onlineHours}h`} tone="green" />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 px-3 py-2.5">
          <CarFront className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-ink-soft">
            Vehicle <span className="font-semibold text-ink">{driver.plate}</span> · {driver.vehicle?.brand} · next inspection in {driver.vehicle?.nextService} days.
          </p>
        </div>
      </div>
    </Drawer>
  )
}

function Signal({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-line bg-surface2/60 px-3 py-2">
      <p className="text-[10.5px] font-medium text-ink-faint">{label}</p>
      <p className={`mt-0.5 text-sm font-bold text-tabular ${tone === 'green' ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>{value}</p>
    </div>
  )
}