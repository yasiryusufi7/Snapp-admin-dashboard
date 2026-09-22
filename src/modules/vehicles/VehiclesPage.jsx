import { useMemo, useState } from 'react'
import { Car, Eye, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { vehicleService } from '../../services/vehicleService'
import { db } from '../../data/db'
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
import { Drawer } from '../../components/ui/Drawer'
import { usePageGuard } from '../../components/common/PageGuard'
import { VEHICLE_TYPE_LABELS } from '../../utils/constants'

const createFilters = () => ({ type: undefined, status: undefined })

export default function VehiclesPage() {
  const guard = usePageGuard('vehicles')
  if (guard) return guard

  const { toast } = useToast()
  const state = useListState({ defaultSort: 'plate', defaultDir: 'asc' })
  const [filters, setFilters] = useState(createFilters)
  const [selected, setSelected] = useState(null)

  const { data, loading } = useAsync(
    () => vehicleService.list({
      ...state.params,
      filters: {
        ...state.filters,
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.status ? { active: filters.status === 'active' } : {}),
      },
    }),
    [state.params, filters],
  )

  const totals = useMemo(() => {
    const types = {}
    for (const v of db.vehicles) types[v.type] = (types[v.type] || 0) + 1
    return types
  }, [])

  const driverFor = (plate) => db.drivers.find((d) => d.plate === plate)

  const columns = [
    {
      key: 'plate', label: 'Vehicle', sortable: true, render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface3 text-ink-faint"><Car className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-semibold text-ink">{v.plate}</p>
            <p className="font-mono text-[11px] text-ink-faint">{v.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'driver', label: 'Driver', render: (v) => {
        const d = driverFor(v.plate)
        return d ? <span className="text-ink-soft">{d.name} <span className="text-ink-faint">· {d.city}</span></span> : <span className="text-ink-faint">Unassigned</span>
      },
    },
    {
      key: 'type', label: 'Type', render: (v) => <Badge tone={v.type === 'executive' ? 'violet' : v.type === 'eco' ? 'green' : v.type === 'xl' ? 'blue' : 'slate'}>{VEHICLE_TYPE_LABELS[v.type]}</Badge>,
    },
    { key: 'spec', label: 'Model', render: (v) => <span className="text-ink-soft">{v.brand} · {v.year} · {v.color}</span> },
    {
      key: 'docs', label: 'Documents', render: (v) => {
        const verified = v.documents.filter((d) => d.status === 'verified').length
        const hasIssue = v.documents.some((d) => d.status === 'expired' || d.status === 'rejected')
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-tabular text-[13px] font-medium text-ink">{verified}/3</span>
            {hasIssue && <Badge tone="red">action</Badge>}
          </span>
        )
      },
    },
    { key: 'nextService', label: 'Next service', align: 'right', tabular: true, render: (v) => <span className={v.nextService < 20 ? 'font-semibold text-amber-600' : 'text-ink-soft'}>{v.nextService}d</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={STATUS.vehicle[v.active ? 'active' : 'idle']} /> },
    {
      key: 'actions', label: '', align: 'right', render: (v) => (
        <Menu label="Vehicle actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          <MenuItem icon={Eye} onClick={() => setSelected(v)}>View details</MenuItem>
          <MenuItem icon={ShieldCheck} onClick={() => toast({ title: 'Verification requested', description: `${v.plate} sent for re-verification.`, tone: 'info' })}>Request verification</MenuItem>
        </Menu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Vehicles"
        description="Fleet registry, document compliance and maintenance windows."
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
            {Object.entries(totals).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1 text-ink-soft"><span className="font-bold text-ink text-tabular">{v}</span>{VEHICLE_TYPE_LABELS[k]}</span>
            ))}
          </div>
        }
      />

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search plate, brand, ID…" className="w-64" />
        <FilterSelect label="Type" value={filters.type} onChange={(v) => setFilters((f) => ({ ...f, type: v }))} placeholder="All types" options={Object.entries(VEHICLE_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={[{ value: 'active', label: 'Active' }, { value: 'idle', label: 'Idle' }]} />
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
          onRowClick={(v) => setSelected(v)}
        />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>

      {selected && <VehicleDrawer vehicle={selected} driver={driverFor(selected.plate)} onClose={() => setSelected(null)} />}
    </div>
  )
}

function VehicleDrawer({ vehicle, driver, onClose }) {
  return (
    <Drawer open onClose={onClose} title={`${vehicle.plate}`} description={`${vehicle.brand} · ${vehicle.year} · ${vehicle.color}`} width="w-[28rem]">
      <div className="flex items-center gap-3 rounded-xl border border-line p-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${vehicle.colorHex}33` }}>
          <Car className="h-5 w-5 text-ink-soft" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{vehicle.brand} · {vehicle.type}</p>
          <p className="text-xs text-ink-soft">Registered {vehicle.year} · {vehicle.seats} seats</p>
        </div>
        <StatusBadge status={STATUS.vehicle[vehicle.active ? 'active' : 'idle']} />
      </div>

      {driver && (
        <div className="mt-4 rounded-xl border border-line p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Assigned driver</p>
          <p className="mt-1 text-sm font-medium text-ink">{driver.name}</p>
          <p className="text-xs text-ink-soft">{driver.id} · {driver.area}, {driver.city}</p>
        </div>
      )}

      <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Documents</p>
      <div className="space-y-2">
        {vehicle.documents.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
            <span className="text-[13px] font-medium text-ink">{d.name}</span>
            <StatusBadge status={STATUS.verification[d.status]} size="sm" />
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface2 px-3 py-2.5">
          <p className="text-[11px] text-ink-faint">Last service</p>
          <p className="mt-0.5 text-sm font-bold text-ink text-tabular">{vehicle.lastService} days ago</p>
        </div>
        <div className="rounded-lg bg-surface2 px-3 py-2.5">
          <p className="text-[11px] text-ink-faint">Next service</p>
          <p className="mt-0.5 text-sm font-bold text-ink text-tabular">in {vehicle.nextService} days</p>
        </div>
      </div>
    </Drawer>
  )
}