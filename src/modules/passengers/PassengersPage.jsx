import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, MoreHorizontal, ShieldBan, ShieldCheck, UsersRound } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { passengerService } from '../../services/passengerService'
import { fmtCurrency, fmtNumber, fmtDate } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { DataTable } from '../../components/tables/DataTable'
import { Pagination } from '../../components/tables/Pagination'
import { SearchInput } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton } from '../../components/ui/Button'
import { Button } from '../../components/ui/Button'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { usePageGuard } from '../../components/common/PageGuard'

const createFilters = () => ({ status: undefined, city: undefined })

export default function PassengersPage() {
  const guard = usePageGuard('passengers')
  if (guard) return guard

  const navigate = useNavigate()
  const { toast } = useToast()
  const state = useListState({ defaultSort: 'joined', defaultDir: 'desc' })
  const [filters, setFilters] = useState(createFilters)

  const { data, loading } = useAsync(
    () => passengerService.list({ ...state.params, filters: { ...state.filters, ...filters } }),
    [state.params, filters],
  )

  const cities = useMemo(() => data ? ['', ...new Set(data.items.map((p) => p.city))] : [''] , [data])

  const toggleStatus = async (pax) => {
    const next = pax.status === 'active' ? 'suspended' : 'active'
    await passengerService.setStatus(pax.id, next)
    state.reload?.()
    toast({ title: `${pax.name} ${next === 'active' ? 'activated' : 'suspended'}`, tone: next === 'active' ? 'success' : 'warning' })
  }

  const columns = [
    {
      key: 'passenger', label: 'Passenger', render: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={p.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{p.name}</p>
            <p className="font-mono text-[11px] text-ink-faint">{p.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (p) => <span className="whitespace-nowrap text-ink-soft text-tabular">{p.phone}</span> },
    { key: 'email', label: 'Email', render: (p) => <span className="block max-w-[190px] truncate text-ink-soft">{p.email}</span> },
    { key: 'trips', label: 'Trips', sortable: true, align: 'right', tabular: true, render: (p) => <span className="font-medium text-ink">{fmtNumber(p.trips)}</span> },
    { key: 'totalSpent', label: 'Total spent', sortable: true, align: 'right', tabular: true, render: (p) => <span className="font-medium text-ink">{fmtCurrency(p.totalSpent)}</span> },
    { key: 'city', label: 'City', render: (p) => <span className="text-ink-soft">{p.city}</span> },
    {
      key: 'status', label: 'Status', render: (p) => (
        <StatusBadge status={p.status === 'active' ? { label: 'Active', tone: 'green' } : p.status === 'suspended' ? { label: 'Suspended', tone: 'amber' } : { label: 'Banned', tone: 'red' }} />
      ),
    },
    { key: 'joined', label: 'Joined', sortable: true, render: (p) => <span className="whitespace-nowrap text-ink-faint text-tabular">{fmtDate(p.joined)}</span> },
    {
      key: 'actions', label: '', align: 'right', render: (p) => (
        <Menu
          label="Passenger actions"
          trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}
        >
          <MenuItem icon={Eye} onClick={() => navigate(`/passengers/${p.id}`)}>View profile</MenuItem>
          {p.status === 'active' ? (
            <MenuItem icon={ShieldBan} danger onClick={() => toggleStatus(p)}>Suspend account</MenuItem>
          ) : (
            <MenuItem icon={ShieldCheck} onClick={() => toggleStatus(p)}>Activate account</MenuItem>
          )}
        </Menu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Passengers"
        description="Rider accounts, activity and lifetime value across the network."
        actions={<Button variant="secondary" icon={UsersRound} onClick={() => toast({ title: 'Export started', description: 'Passenger CSV export queued.', tone: 'info' })}>Export</Button>}
      />

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search name, phone, email…" className="w-64" />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'banned', label: 'Banned' }]} />
        <FilterSelect label="City" value={filters.city} onChange={(v) => setFilters((f) => ({ ...f, city: v }))} placeholder="All cities" options={[{ value: 'Kabul', label: 'Kabul' }, { value: 'Mazar-e-Sharif', label: 'Mazar-e-Sharif' }, { value: 'Herat', label: 'Herat' }, { value: 'Kandahar', label: 'Kandahar' }, { value: 'Jalalabad', label: 'Jalalabad' }]} />
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
          onRowClick={(p) => navigate(`/passengers/${p.id}`)}
        />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>
    </div>
  )
}