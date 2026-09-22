import { useMemo, useState } from 'react'
import { CalendarClock, Clock, MoreHorizontal, Radio, Send, XCircle } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useListState } from '../../hooks/useListState'
import { bookingService } from '../../services/bookingService'
import { fmtCurrency, fmtDateTime, hoursFromNow } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { DataTable } from '../../components/tables/DataTable'
import { Pagination } from '../../components/tables/Pagination'
import { SearchInput } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Menu, MenuItem } from '../../components/ui/Menu'
import { IconButton, Button } from '../../components/ui/Button'
import { FilterBar, FilterSelect } from '../../components/forms/FilterBar'
import { usePageGuard } from '../../components/common/PageGuard'

const createFilters = () => ({ status: undefined, vehicleType: undefined })

export default function BookingsPage() {
  const guard = usePageGuard('bookings')
  if (guard) return guard

  const { toast } = useToast()
  const state = useListState({ defaultSort: 'scheduledFor', defaultDir: 'asc' })
  const [filters, setFilters] = useState(createFilters)

  const { data, loading, mutate } = useAsync(
    () => bookingService.list({ ...state.params, filters: { ...state.filters, ...filters } }),
    [state.params, filters],
  )

  const upcoming = data?.items || []
  const next24h = upcoming.filter((b) => b.scheduledFor - Date.now() < 86400000 && b.status !== 'cancelled').length

  const assign = async (b) => {
    await bookingService.assign(b.id)
    mutate((prev) => (prev ? { ...prev, items: prev.items.map((x) => (x.id === b.id ? { ...x, status: 'assigned' } : x)) } : prev))
    toast({ title: 'Dispatcher sent', description: `A driver will be routed to pickup for ${b.id} (${hoursFromNow(b.scheduledFor)}).`, tone: 'success' })
  }

  const cancel = async (b) => {
    await bookingService.cancel(b.id)
    mutate((prev) => (prev ? { ...prev, items: prev.items.map((x) => (x.id === b.id ? { ...x, status: 'cancelled' } : x)) } : prev))
    toast({ title: `${b.id} cancelled`, description: 'Passenger has been notified and refund is being processed.', tone: 'warning' })
  }

  const columns = [
    { key: 'id', label: 'Booking', render: (b) => <span className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{b.id}</span> },
    { key: 'passenger', label: 'Passenger', render: (b) => <span className="text-ink-soft">{b.passenger}</span> },
    {
      key: 'route', label: 'Route', render: (b) => (
        <div className="flex items-center gap-1.5 text-ink-soft">
          <span className="block max-w-[150px] truncate">{b.pickup}</span>
          <span className="text-ink-faint">→</span>
          <span className="block max-w-[150px] truncate">{b.destination}</span>
        </div>
      ),
    },
    { key: 'city', label: 'City', render: (b) => <span className="text-ink-soft">{b.city}</span> },
    {
      key: 'scheduledFor', label: 'Scheduled', sortable: true, render: (b) => (
        <div className="whitespace-nowrap">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink text-tabular"><Clock className="h-3.5 w-3.5 text-amber-500" />{b.status !== 'cancelled' ? hoursFromNow(b.scheduledFor) : '—'}</p>
          <p className="font-mono text-[11px] text-ink-faint text-tabular">{fmtDateTime(b.scheduledFor)}</p>
        </div>
      ),
    },
    { key: 'type', label: 'Type', render: (b) => <Badge tone={b.vehicleType === 'executive' ? 'violet' : b.vehicleType === 'eco' ? 'green' : 'slate'}>{b.vehicleType}</Badge> },
    { key: 'pax', label: 'Pax', align: 'right', tabular: true, render: (b) => <span className="text-ink-soft">{b.passengers}<span className="text-ink-faint">{b.luggage ? ' +bags' : ''}</span></span> },
    { key: 'fare', label: 'Est. fare', sortable: true, align: 'right', tabular: true, render: (b) => <span className="font-semibold text-ink">{fmtCurrency(b.fare, { compact: true })}</span> },
    { key: 'paymentStatus', label: 'Prepay', render: (b) => <StatusBadge status={STATUS.payment[b.paymentStatus]} size="sm" /> },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={STATUS.booking[b.status]} /> },
    {
      key: 'actions', label: '', align: 'right', render: (b) => (
        <Menu label="Booking actions" trigger={<IconButton label="Row actions" icon={MoreHorizontal} size="sm" />}>
          {b.status === 'scheduled' && <MenuItem icon={Radio} onClick={() => assign(b)}>Dispatch now</MenuItem>}
          {b.paymentStatus !== 'prepaid' && <MenuItem icon={Send} onClick={() => toast({ title: 'Reminder sent', description: `${b.passenger} reminded to pre-pay ${fmtCurrency(b.fare)}.`, tone: 'info' })}>Send prepay reminder</MenuItem>}
          {b.status !== 'cancelled' && <MenuItem icon={XCircle} danger onClick={() => cancel(b)}>Cancel booking</MenuItem>}
        </Menu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Bookings"
        description="Scheduled and prepaid rides across the fleet."
        actions={<Badge tone="blue"><CalendarClock className="h-3.5 w-3.5" /> {next24h} in next 24h</Badge>}
      />

      <FilterBar onClear={() => { setFilters(createFilters()); state.clearFilters() }} dirty={state.dirty || Object.values(filters).some(Boolean)}>
        <SearchInput value={state.search} onChange={state.setSearch} placeholder="Search booking ID, passenger…" className="w-64" />
        <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} placeholder="All statuses" options={Object.entries(STATUS.booking).map(([k, v]) => ({ value: k, label: v.label }))} />
        <FilterSelect label="Vehicle type" value={filters.vehicleType} onChange={(v) => setFilters((f) => ({ ...f, vehicleType: v }))} placeholder="All types" options={[{ value: 'economy', label: 'Economy' }, { value: 'executive', label: 'Executive' }, { value: 'xl', label: 'XL' }, { value: 'eco', label: 'Electric' }]} />
      </FilterBar>

      <div className="card-surface overflow-hidden">
        <DataTable
          columns={columns}
          rows={upcoming}
          rowKey="id"
          loading={loading}
          sort={state.sort}
          dir={state.dir}
          onSort={state.onSort}
        />
        <Pagination page={data?.page || 1} pages={data?.pages || 1} total={data?.total || 0} pageSize={state.pageSize} onPageChange={state.setPage} onPageSizeChange={state.setPageSize} />
      </div>
    </div>
  )
}