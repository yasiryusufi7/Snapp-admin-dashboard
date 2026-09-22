import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, MoreHorizontal, Route as RouteIcon, ShieldAlert } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { tripService } from '../../services/tripService'
import { fmtCurrency, fmtDateTime, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { DataTable } from '../../components/tables/DataTable'
import { Pagination } from '../../components/tables/Pagination'
import { SearchInput } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton } from '../../components/ui/Button'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { usePageGuard } from '../../components/common/PageGuard'

const createFilters = () => ({ status: undefined, vehicleType: undefined, paymentMethod: undefined })

export default function TripsPage() {
  const guard = usePageGuard('trips')
  if (guard) return guard

  const navigate = useNavigate()
  const { toast } = useToast()
  const state = useListState({ defaultSort: 'requestedAt', defaultDir: 'desc' })
  const [filters, setFilters] = useState(createFilters)

  const { data, loading } = useAsync(
    () => tripService.list({ ...state.params, filters: { ...state.filters, ...filters } }),
    [state.params, filters],
  )

  const anomalyCount = data?.items.filter((t) => t.anomaly).length || 0

  const columns = [
    {
      key: 'id', label: 'Trip', sortable: true, render: (t) => (
        <div className="flex items-center gap-2">
          {t.anomaly && <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />}
          <span className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{t.id}</span>
        </div>
      ),
    },
    {
      key: 'route', label: 'Route', render: (t) => (
        <div className="flex items-center gap-1.5 text-ink-soft">
          <span className="block max-w-[170px] truncate">{t.pickup}</span>
          <span className="text-ink-faint">→</span>
          <span className="block max-w-[170px] truncate">{t.destination}</span>
        </div>
      ),
    },
    { key: 'passenger', label: 'Passenger', render: (t) => <span className="whitespace-nowrap text-ink-soft">{t.passenger}</span> },
    { key: 'driver', label: 'Driver', render: (t) => <span className="whitespace-nowrap text-ink-soft">{t.driver}</span> },
    { key: 'distance', label: 'Dist.', align: 'right', tabular: true, render: (t) => <span className="text-ink-soft text-tabular">{t.distanceKm} km</span> },
    { key: 'fare', label: 'Fare', sortable: true, align: 'right', tabular: true, render: (t) => <span className="font-semibold text-ink">{t.fare} AFN</span> },
    { key: 'payment', label: 'Payment', render: (t) => <span className="capitalize text-ink-soft">{t.paymentMethod}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={STATUS.trip[t.status]} /> },
    { key: 'when', label: 'Requested', align: 'right', render: (t) => <span className="whitespace-nowrap font-mono text-[11px] text-ink-faint text-tabular" title={fmtDateTime(t.requestedAt)}>{timeAgo(t.requestedAt)}</span> },
    {
      key: 'actions', label: '', align: 'right', render: (t) => (
        <Menu label="Trip actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          <MenuItem icon={RouteIcon} onClick={() => navigate(`/trips/${t.id}`)}>Open trip detail</MenuItem>
          {t.anomaly && (
            <MenuItem icon={AlertTriangle} danger onClick={() => toast({ title: 'Flag raised', description: `${t.id} reported to the safety team.`, tone: 'warning' })}>Report anomaly</MenuItem>
          )}
        </Menu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Trips"
        description="Every ride across the network: live, completed, cancelled and flagged."
        actions={anomalyCount > 0 ? <Badge tone="amber"><AlertTriangle className="h-3.5 w-3.5" /> {anomalyCount} flagged this page</Badge> : undefined}
      />

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search trip ID, route, name…" className="w-64" />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={Object.entries(STATUS.trip).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="Vehicle" value={filters.vehicleType} onChange={(v) => setFilters((f) => ({ ...f, vehicleType: v }))} placeholder="All vehicles" options={[{ value: 'economy', label: 'Economy' }, { value: 'executive', label: 'Executive' }, { value: 'xl', label: 'XL' }, { value: 'eco', label: 'Electric' }]} />
        <FilterSelect label="Payment" value={filters.paymentMethod} onChange={(v) => setFilters((f) => ({ ...f, paymentMethod: v }))} placeholder="All methods" options={[{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'wallet', label: 'Wallet' }]} />
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
          onRowClick={(t) => navigate(`/trips/${t.id}`)}
        />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>
    </div>
  )
}