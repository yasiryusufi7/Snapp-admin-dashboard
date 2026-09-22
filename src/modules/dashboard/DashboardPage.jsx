import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  CarFront,
  ChevronRight,
  CircleAlert,
  Clock3,
  Hotel,
  LineChart,
  MapPin,
  Route,
  UserPlus,
  UsersRound,
  Wallet,
  Waves,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '../../data/db'
import { fmtCurrency, fmtNumber, fmtPercent, pctChange, timeAgo } from '../../utils/format'
import { STATUS } from '../../utils/constants'
import { PageHeader } from '../../components/navigation/PageHeader'
import { LiveIndicator } from '../../components/operations/LiveIndicator'
import { StatCard } from '../../components/charts/StatCard'
import { ChartCard, ChartLegend } from '../../components/charts/ChartCard'
import { ChartTooltip } from '../../components/charts/ChartTooltip'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { usePageGuard } from '../../components/common/PageGuard'

const COLORS = {
  brand: '#c8f135',
  green: '#16a34a',
  red: '#ef4444',
  blue: '#3b82f6',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  slate: '#94a3b8',
}

export default function DashboardPage() {
  const guard = usePageGuard('dashboard')
  if (guard) return guard

  const series = db.series
  const kpis = db.kpis

  const dailyRevenue = useMemo(() => series.daily.map((d) => ({ date: d.date, revenue: d.revenue, commission: d.commission })), [series])
  const marketHourly = useMemo(() => series.tripsByHour.slice(6, 24), [series])
  const cust = useMemo(() => ({
    completed: series.daily.reduce((s, d) => s + d.completed, 0),
    cancelled: series.daily.reduce((s, d) => s + d.cancelled, 0),
  }), [series])

  const recentTrips = useMemo(() => db.trips.slice(0, 7), [])
  const openComplaints = useMemo(() => db.complaints.filter((c) => ['new', 'in_review', 'assigned'].includes(c.status)).slice(0, 5), [])
  const activeDrivers = useMemo(() =>
    db.drivers.filter((d) => ['available', 'busy', 'break'].includes(d.status)).slice(0, 6), [])

  const [range, setRange] = useState('7d')

  const rangeScale = { today: 1 / 30, '7d': 7 / 30, '30d': 1 }[range]
  const revenueDisplay = Math.round(kpis.revenue30d * rangeScale)

  const [analyticsRange, setAnalyticsRange] = useState('30d')
  const analyticsView = useMemo(() => {
    if (analyticsRange === '7d') return series.daily.slice(-7)
    if (analyticsRange === '90d') {
      const r = []
      for (let i = 0; i < 30; i++) {
        const base = series.daily[i % 30]
        r.push({ ...base, iso: base.iso - i * 86400000 })
      }
      return r
    }
    return series.daily
  }, [series, analyticsRange])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Platform overview"
        description="Real-time executive view of supply, demand and financial health across all cities."
        live
        actions={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[{ value: 'today', label: 'Today' }, { value: '7d', label: '7D' }, { value: '30d', label: '30D' }]}
          />
        }
      />

      {/* ============ LIVE OPERATIONS RIBBON ============ */}
      <section className="relative overflow-hidden rounded-xl border border-navy-800 bg-navy-900 px-5 py-4 text-white shadow-card">
        <div className="pointer-events-none absolute inset-0 dotgrid-bg opacity-[0.07]" />
        <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3 pr-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8">
              <Waves className="h-4.5 w-4.5 text-brand-300" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live market</p>
              <p className="flex items-center gap-2 text-sm font-semibold">
                All cities operational
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              </p>
            </div>
          </div>

          {[
            { label: 'Active trips', value: fmtNumber(kpis.activeTrips), tone: 'text-brand-300' },
            { label: 'Online drivers', value: fmtNumber(kpis.onlineDrivers) },
            { label: 'Pending requests', value: fmtNumber(kpis.pendingRequests), tone: 'text-amber-300' },
          ].map((m) => (
            <div key={m.label} className="min-w-[92px]">
              <p className="text-[11px] font-medium text-slate-400">{m.label}</p>
              <p className={`font-mono text-lg font-bold tracking-tight text-tabular ${m.tone || 'text-white'}`}>{m.value}</p>
            </div>
          ))}

          <div className="relative hidden h-14 flex-1 min-w-[200px] lg:block">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketHourly} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="vsd-demand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1aa28f" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1aa28f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="demand" stroke="#36bda9" strokeWidth={1.6} fill="url(#vsd-demand)" isAnimationActive={false} dot={false} />
                <Area type="monotone" dataKey="supply" stroke="#94a3b8" strokeWidth={1.4} fill="none" strokeDasharray="4 4" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Link
            to="/live-operations"
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-white/8 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/14"
          >
            Open command center <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============ CORE KPIs ============ */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          variant="rail"
          tone="brand"
          label="Revenue · 30d"
          value={fmtCurrency(revenueDisplay, { compact: true })}
          trend={pctChange(31800000, 31240000)}
          context="Gross platform revenue, net of refunds"
          icon={Wallet}
          spark={series.daily.map((d) => ({ value: d.revenue }))}
          sparkColor={COLORS.brand}
        />
        <StatCard
          variant="rail"
          tone="blue"
          label="Trips · 30d"
          value={fmtNumber(kpis.totalTrips30d, { compact: true })}
          trend={pctChange(432000, 428000)}
          context={`${fmtNumber(cust.completed)} completed · ${fmtNumber(cust.cancelled)} cancelled`}
          icon={Route}
          spark={series.daily.map((d) => ({ value: d.completed }))}
          sparkColor={COLORS.blue}
        />
        <StatCard
          variant="rail"
          tone="violet"
          label="Commission · 30d"
          value={fmtCurrency(kpis.commission30d, { compact: true })}
          trend={pctChange(6120000, 5920000)}
          context="Net commission after driver settlement"
          icon={Zap}
          spark={series.daily.map((d) => ({ value: d.commission }))}
          sparkColor={COLORS.violet}
        />
        <StatCard
          variant="rail"
          tone="amber"
          label="Open complaints"
          value={fmtNumber(kpis.openComplaints)}
          trend={pctChange(412, 378)}
          context="Across all 5 cities · SLA 98.2%"
          icon={CircleAlert}
          spark={openComplaints.map((_, i) => ({ value: 40 - i * 3 }))}
          sparkColor={COLORS.amber}
        />
      </section>

      {/* ============ MARKETPLACE ============ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Marketplace balance"
          description="Requests entering the platform vs available supply · today"
          className="lg:col-span-2"
          actions={<ChartLegend items={[{ label: 'Demand', color: COLORS.brand }, { label: 'Supply', color: COLORS.slate }]} />}
        >
          <div className="h-72 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketHourly} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="dm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1aa28f" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1aa28f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickFormatter={(h) => `${String(h).padStart(2, '0')}:00`} interval={2} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} />
                <RTooltip content={<ChartTooltip formatter={(v) => fmtNumber(v)} />} />
                <Area type="monotone" dataKey="demand" name="Demand" stroke={COLORS.brand} strokeWidth={2} fill="url(#dm)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="supply" name="Supply" stroke={COLORS.slate} strokeWidth={2} fill="url(#sp)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Operations quality stack */}
        <div className="flex flex-col gap-4">
          <div className="card-surface flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <Clock3 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink-faint">Average pickup time</p>
              <p className="font-mono text-xl font-bold text-ink text-tabular">{kpis.avgPickupTime}<span className="text-sm font-semibold text-ink-faint"> min</span></p>
            </div>
            <Badge tone="green">−0.6 min</Badge>
          </div>

          <div className="card-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-ink-faint">Cancellation rate</p>
              <span className="font-mono text-xl font-bold text-ink text-tabular">{fmtPercent(kpis.cancellationRate)}</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'completed', value: 91.8 }, { name: 'cancelled', value: 8.2 }]} dataKey="value" innerRadius={34} outerRadius={52} paddingAngle={3} startAngle={90} endAngle={-270} strokeWidth={0}>
                    <Cell fill={COLORS.green} />
                    <Cell fill={COLORS.red} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed 91.8%</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Cancelled 8.2%</span>
            </div>
          </div>

          <div className="card-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-ink-faint">Driver utilization</p>
              <span className="font-mono text-xl font-bold text-ink text-tabular">{kpis.utilization}%</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface3">
              <div className="h-full bg-emerald-500" style={{ width: '41%' }} />
              <div className="h-full bg-brand-500" style={{ width: '23.5%' }} />
              <div className="h-full bg-amber-500" style={{ width: '14%' }} />
              <div className="h-full bg-slate-300" style={{ width: '21.5%' }} />
            </div>
            <div className="mt-2.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-full bg-emerald-500" />On trip 41%</span>
              <span className="inline-flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-full bg-brand-500" />Available 23.5%</span>
              <span className="inline-flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-full bg-amber-500" />Break 14%</span>
              <span className="inline-flex items-center gap-1.5 text-ink-soft"><span className="h-2 w-2 rounded-full bg-slate-300" />Offline 21.5%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRIPS + REVENUE ============ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Trips over time"
          description="Completed vs cancelled · selected range"
          className="lg:col-span-2"
          actions={<ChartLegend items={[{ label: 'Completed', color: COLORS.green }, { label: 'Cancelled', color: COLORS.red }]} />}
        >
          <div className="h-64 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={range === 'today' ? series.daily.slice(-1) : range === '7d' ? series.daily.slice(-7) : series.daily} margin={{ top: 6, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10.5, fill: 'rgb(var(--c-ink-faint))' }} interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} />
                <RTooltip content={<ChartTooltip formatter={(v) => fmtNumber(v)} />} cursor={{ fill: 'rgb(var(--c-line) / 0.35)' }} />
                <Bar dataKey="completed" name="Completed" fill={COLORS.green} radius={[3, 3, 0, 0]} maxBarSize={22} />
                <Bar dataKey="cancelled" name="Cancelled" fill={COLORS.red} radius={[3, 3, 0, 0]} maxBarSize={22} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by city" description="Gross fare volume · last 30 days">
          <div className="flex items-center gap-2 p-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={series.revenueByCity} dataKey="value" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={2} strokeWidth={0}>
                    {series.revenueByCity.map((c) => (
                      <Cell key={c.name} fill={c.color || COLORS.brand} />
                    ))}
                  </Pie>
                  <RTooltip content={<ChartTooltip formatter={(v) => fmtCurrency(v)} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5">
              {series.revenueByCity.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-2 text-ink-soft"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color || COLORS.brand }} />{c.name}</span>
                  <span className="font-semibold text-ink text-tabular">{fmtCurrency(c.value, { compact: true })}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </section>

      {/* ============ PEAK HOURS / DRIVERS / DEMAND ============ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Peak hours" description="Trip volume by hour of day">
          <div className="h-56 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.peakHours} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="pk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--c-ink-faint))' }} interval={3} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'rgb(var(--c-ink-faint))' }} />
                <RTooltip content={<ChartTooltip formatter={(v) => fmtNumber(v)} />} />
                <Area type="monotone" dataKey="count" name="Trips" stroke="#f59e0b" strokeWidth={2} fill="url(#pk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-xs">
            <span className="text-ink-faint">Evening peak</span>
            <span className="font-semibold text-amber-600 dark:text-amber-300 text-tabular">18:00 – 21:00 · 1.42× baseline</span>
          </div>
        </ChartCard>

        <div className="card-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CarFront className="h-4 w-4 text-ink-faint" /> Drivers on the road
            </h3>
            <Link to="/drivers" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 dark:text-brand-200">All drivers <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="divide-y divide-line/70">
            {activeDrivers.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-5 py-2.5">
                <Avatar name={d.name} size="sm" status={d.status === 'busy' ? 'busy' : 'online'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{d.name}</p>
                  <p className="truncate text-xs text-ink-soft">{d.plate} · {d.area}</p>
                </div>
                <StatusBadge status={STATUS.driver[d.status]} />
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-ink-faint" /> Demand hotspots
            </h3>
            <LiveIndicator label="Live" />
          </div>
          <ul className="divide-y divide-line/70">
            {db.hotspots.slice(0, 6).map((h, i) => (
              <li key={h.id} className="flex items-center gap-3 px-5 py-2.5">
                <span className="w-5 font-mono text-xs font-bold text-ink-faint text-tabular">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{h.name}</p>
                  <p className="text-xs text-ink-soft text-tabular">{h.pending} pending rides</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {h.surge && <Badge tone="amber">{h.surge.toFixed(1)}×</Badge>}
                  <Badge tone={h.intensity > 80 ? 'red' : h.intensity > 60 ? 'amber' : 'slate'}>demand {h.intensity}%</Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ RECENT ACTIVITY ============ */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <LineChart className="h-4 w-4 text-ink-faint" /> Live trip feed
            </h3>
            <Link to="/trips" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 dark:text-brand-200">View trips <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-semibold">Trip</th>
                  <th className="px-3 py-2.5 font-semibold">Route</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Fare</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Status</th>
                  <th className="px-5 py-2.5 text-right font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {recentTrips.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-surface2/60">
                    <td className="px-5 py-2.5">
                      <Link to={`/trips/${t.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-brand-200">{t.id}</Link>
                      <p className="flex items-center gap-1 text-xs text-ink-soft"><UsersRound className="h-3 w-3" />{t.passenger}</p>
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5">
                      <p className="truncate text-xs text-ink-soft">{t.pickup} → {t.destination}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-ink text-tabular">{t.fare} AFN</td>
                    <td className="px-3 py-2.5 text-right"><StatusBadge status={STATUS.trip[t.status]} size="sm" /></td>
                    <td className="px-5 py-2.5 text-right text-xs text-ink-faint text-tabular">{timeAgo(t.requestedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CircleAlert className="h-4 w-4 text-ink-faint" /> Priority complaints
            </h3>
            <Link to="/complaints" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 dark:text-brand-200">Queue <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="divide-y divide-line/70">
            {openComplaints.map((c) => (
              <li key={c.id} className="px-5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/complaints/${c.ticket}`} className="truncate text-[13px] font-medium text-ink hover:underline">{c.subject}</Link>
                  <Badge tone={c.priority === 'critical' ? 'red' : c.priority === 'high' ? 'amber' : 'slate'} size="sm">{c.priority}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">{c.ticket} · {c.passenger} · {timeAgo(c.created)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ ANALYTICS ============ */}
      <section className="space-y-5 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Analytics</h2>
            <p className="text-xs text-ink-faint">Demand, supply, retention and economics — deep-dive exploration.</p>
          </div>
          <SegmentedControl
            value={analyticsRange}
            onChange={setAnalyticsRange}
            options={[{ value: '7d', label: '7D' }, { value: '30d', label: '30D' }, { value: '90d', label: '90D' }]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Trips completed" value={fmtNumber(series.daily.reduce((s, d) => s + d.completed, 0), { compact: true })} icon={Activity} hint="30d" />
          <StatCard label="Cancelled" value={`${((series.daily.reduce((s, d) => s + d.cancelled, 0) / (series.daily.reduce((s, d) => s + d.completed + d.cancelled, 0) || 1)) * 100).toFixed(1)}%`} icon={BarChart3} tone="amber" hint="of requests" />
          <StatCard label="Gross revenue" value={fmtCurrency(series.daily.reduce((s, d) => s + d.revenue, 0), { compact: true })} icon={Hotel} tone="green" hint="30d" />
          <StatCard label="Avg pickup" value={`${(series.daily.reduce((s, d) => s + d.pickupTime, 0) / series.daily.length).toFixed(1)}m`} icon={BatteryCharging} hint="request → arrive" />
          <StatCard label="New passengers" value={fmtNumber(series.newPassengers.reduce((s, d) => s + d.value, 0), { compact: true })} icon={UserPlus} hint="30d acquisition" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard className="lg:col-span-2" title="Revenue & commission" subtitle="Daily gross and take" actions={<ChartLegend items={[{ color: COLORS.brand, label: 'Revenue' }, { color: COLORS.violet, label: 'Commission' }]} />}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsView} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.brand} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={{ stroke: 'rgb(var(--c-line))' }} interval="preserveStartEnd" minTickGap={28} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtCurrency(v, { compact: true })} width={64} />
                  <RTooltip content={<ChartTooltip formatter={(v) => fmtCurrency(v)} />} />
                  <Area type="monotone" dataKey="revenue" stroke="none" fill="url(#revFill)" />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.brand} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="commission" stroke={COLORS.violet} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Demand × supply" subtitle="24h curve" actions={<ChartLegend items={[{ color: COLORS.brand, label: 'Demand' }, { color: COLORS.blue, label: 'Supply' }]} />}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={series.tripsByHour} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={{ stroke: 'rgb(var(--c-line))' }} tickFormatter={(h) => `${String(h).padStart(2, '0')}h`} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} width={44} />
                  <RTooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="demand" stroke={COLORS.brand} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="supply" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Vehicle mix" subtitle="Share by completed trips">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={series.vehicleUtil} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} strokeWidth={0}>
                    {series.vehicleUtil.map((s) => (
                      <Cell key={s.name} fill={{ economy: COLORS.brand, executive: COLORS.violet, xl: COLORS.blue, eco: COLORS.green }[s.name]} />
                    ))}
                  </Pie>
                  <RTooltip content={<ChartTooltip suffix="%" />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs capitalize text-ink-soft">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Acquisition vs active riders" subtitle="30d trend">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={subsetReindex(series.newPassengers, series.activePassengers)} margin={{ top: 8, right: 12, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                  <YAxis yAxisId="a" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtNumber(v, { compact: true })} />
                  <YAxis yAxisId="b" orientation="right" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtNumber(v, { compact: true })} width={40} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={{ stroke: 'rgb(var(--c-line))' }} interval="preserveStartEnd" minTickGap={28} />
                  <RTooltip content={<ChartTooltip />} />
                  <Line yAxisId="a" type="monotone" dataKey="active" stroke={COLORS.violet} strokeWidth={2} dot={false} name="Active (in 1000s)" />
                  <Line yAxisId="b" type="monotone" dataKey="new" stroke={COLORS.amber} strokeWidth={2} dot={false} name="New riders" />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Cohort retention" subtitle="D30 / D60 / D90 stickiness">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series.retentionCohorts} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={{ stroke: 'rgb(var(--c-line))' }} />
                  <YAxis domain={[0, 80]} tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} unit="%" width={40} />
                  <RTooltip content={<ChartTooltip suffix="%" />} />
                  <Bar dataKey="d30" name="D30" fill={COLORS.brand} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="d60" name="D60" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="d90" name="D90" fill={COLORS.violet} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <Card>
          <CardHeader title="Pickup latency trend" description="Time from request to driver arrival across the fleet" />
          <CardBody className="p-5">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series.daily} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="puaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={{ stroke: 'rgb(var(--c-line))' }} interval="preserveStartEnd" minTickGap={32} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--c-ink-faint))' }} tickLine={false} axisLine={false} unit="m" width={34} domain={[4, 10]} />
                  <RTooltip content={<ChartTooltip suffix=" min" />} />
                  <Area type="monotone" dataKey="pickupTime" stroke={COLORS.amber} strokeWidth={2} fill="url(#puaFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  )
}

function subsetReindex(newPass, activePass) {
  return newPass.map((n, i) => ({ date: n.date, new: n.value, active: Math.round(activePass[i]?.value / 1000) }))
}