import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, MapPinned, Radio, ThermometerSun } from 'lucide-react'
import { CITIES } from '../../data/cities'
import { db } from '../../data/db'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { MapPanel } from '../../components/operations/MapPanel'
import { usePageGuard } from '../../components/common/PageGuard'

const DEMAND_TONE = { surge: 'red', high: 'amber', normal: 'blue', low: 'slate' }

function areaLoad(area, city) {
  const idx = city.areas.findIndex((a) => a.id === area.id)
  const seed = (city.id.charCodeAt(0) * 31 + area.id.length * 7 + idx * 13) % 100
  return seed
}

export default function CitiesPage() {
  const guard = usePageGuard('cities')
  if (guard) return guard

  const { toast } = useToast()
  const [cityId, setCityId] = useState('kbl')
  const city = CITIES.find((c) => c.id === cityId) || CITIES[0]

  const zones = useMemo(
    () => city.areas.map((a) => ({
      id: a.id,
      name: a.name,
      x: a.x,
      y: a.y,
      r: a.r,
      zone: a.zone,
      fill: city.color,
      demand: a.demand,
    })),
    [city],
  )

  const cityTrips = db.trips.filter((t) => t.city === city.name)
  const cityCompleted = cityTrips.filter((t) => t.status === 'completed')

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Cities & Areas"
        description="Operational zones, demand bands and dispatch balance by city."
        actions={
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface p-1">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCityId(c.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cityId === c.id ? 'bg-brand-600 text-white' : 'text-ink-soft hover:text-ink'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Active drivers', value: String(city.activeDrivers), icon: Radio, tone: 'text-brand-600 dark:text-brand-300' },
          { label: 'Trips in flight', value: String(city.activeTrips), icon: MapPinned },
          { label: 'Demand band', value: <Badge tone={DEMAND_TONE[city.demand]}>{city.demand}</Badge>, icon: ThermometerSun },
          { label: 'City status', value: <StatusBadge status={city.status === 'active' ? { label: 'Live', tone: 'green' } : city.status === 'ramping' ? { label: 'Ramping', tone: 'blue' } : { label: 'Paused', tone: 'slate' }} />, icon: Building2 },
        ].map((s, i) => (
          <div key={i} className="card-surface px-4 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint"><s.icon className="h-3.5 w-3.5" />{s.label}</p>
            <p className={`mt-1 text-lg font-bold text-ink ${s.tone || ''}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Map */}
        <Card className="lg:col-span-3">
          <CardHeader
            title={city.name}
            description={`${city.areas.length} operational zones · ${cityCompleted.length} completed trips in dataset`}
            actions={<Badge tone="slate">{city.zoneCount !== undefined ? `${city.zoneCount} zones` : `${city.areas.length} areas`}</Badge>}
          />
          <div className="h-[420px] p-3">
            <MapPanel
              scheme="light"
              zones={zones}
              hotspots={db.hotspots.filter((h) => h.cityId === city.id).map((h) => ({ ...h, x: h.x, y: h.y }))}
              className="h-full rounded-lg"
            />
          </div>
        </Card>

        {/* Zones list */}
        <Card className="lg:col-span-2">
          <CardHeader title="Zone balance" description="Demand vs. driver density per area" />
          <div className="divide-y divide-line/70">
            {city.areas.map((a) => {
              const load = areaLoad(a, city)
              const density = Math.round(load / 3) + 4
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: city.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-ink">{a.name}</p>
                      <Badge tone={DEMAND_TONE[a.demand]}>{a.demand}</Badge>
                    </div>
                    <p className="text-[11px] text-ink-faint">{a.zone} · ~{density} drivers in area</p>
                    <div className="mt-1.5 flex h-1.5 items-end gap-0.5 overflow-hidden rounded-full bg-surface3">
                      <div className="flex h-full items-end gap-px">
                        {Array.from({ length: 14 }, (_, i) => (
                          <span key={i} className="w-1 rounded-t-sm" style={{ height: `${30 + ((load + i * 7) % 70)}%`, backgroundColor: (load + i * 7) % 100 > 70 ? '#f43f5e' : (load + i * 7) % 100 > 45 ? '#f59e0b' : city.color }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <CardBody className="px-5 pb-4">
            <Button
              fullWidth
              variant="secondary"
              icon={AlertTriangle}
              onClick={() => toast({ title: 'Dispatch alert drafted', description: `Re-balance request for ${city.name} surge zones sent to dispatch.`, tone: 'info' })}
            >
              Rebalance drivers into {city.name}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}