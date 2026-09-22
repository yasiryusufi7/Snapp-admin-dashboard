import { useCallback, useRef, useState } from 'react'
import { Crosshair, Layers, Minus, Plus } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { LIVE_COLORS } from '../../utils/mapColors'

const W = 1000
const H = 640

/* Deterministic street layout for the stylized city. */
const H_ROADS = [70, 150, 230, 315, 400, 485, 565, 620].map((y, i) => ({ y: y + (i % 2 ? -6 : 4), major: i === 3 || i === 5 }))
const V_ROADS = [90, 180, 270, 360, 450, 545, 640, 730, 825, 915].map((x, i) => ({ x: x + (i % 3 ? 5 : -8), major: i === 4 || i === 6 }))
const DIAGONALS = [
  'M 140 0 L 420 640',
  'M 560 0 L 800 640',
  'M 0 220 L 1000 470',
]

function Roads({ scheme }) {
  const c = LIVE_COLORS[scheme]
  return (
    <g>
      {H_ROADS.map((r, i) => (
        <rect key={i} x={-20} y={r.y} width={W + 40} height={r.major ? 5 : 3} rx={2} fill={r.major ? c.roadMajor : c.road} />
      ))}
      {V_ROADS.map((r, i) => (
        <rect key={i} x={r.x} y={-20} width={r.major ? 5 : 3} height={H + 40} rx={2} fill={r.major ? c.roadMajor : c.road} />
      ))}
      {DIAGONALS.map((d, i) => (
        <path key={i} d={d} stroke={i === 1 ? c.roadMajor : c.road} strokeWidth={i === 1 ? 6 : 3.5} fill="none" strokeLinecap="round" />
      ))}
    </g>
  )
}

function Blocks({ scheme }) {
  const c = LIVE_COLORS[scheme]
  const blocks = []
  const seed = [12, 45, 7, 88, 24, 66, 31, 53, 9, 41]
  H_ROADS.forEach((r, ri) => {
    V_ROADS.forEach((v, vi) => {
      if ((ri + vi) % 3 === 0) return
      const id = (ri * 7 + vi * 13) % seed.length
      if (id % 4 === 0) return
      blocks.push(
        <rect
          key={`${ri}-${vi}`}
          x={v.x + 8}
          y={r.y + 8}
          width={26 + seed[id]}
          height={14 + (seed[(id + 3) % seed.length] % 10)}
          rx={2}
          fill={c.block}
        />,
      )
    })
  })
  return <g>{blocks}</g>
}

function Zones({ zones, scheme, labels, hover }) {
  const c = LIVE_COLORS[scheme]
  return (
    <g>
      {zones.map((z) => (
        <g key={z.id}>
          <circle cx={z.x} cy={z.y} r={z.r} fill={c.zoneFill} stroke={hover && hover.id === z.id ? c.zoneStrokeHover : c.zoneStroke} strokeWidth={1.2} strokeDasharray="4 5" />
          {labels && (
            <text x={z.x} y={z.y + 3} textAnchor="middle" fontSize="12" fontWeight={600} fill={hover && hover.id === z.id ? c.zoneLabelHover : c.zoneLabel}>
              {z.name}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

function DriverMarkers({ drivers, scheme, selectedId, onSelect }) {
  return (
    <g>
      {drivers.map((d) => {
        const selected = d.id === selectedId
        const color = d.color || LIVE_COLORS[scheme].driverAvailable
        return (
          <g
            key={d.id}
            transform={`translate(${d.x} ${d.y})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(d)
            }}
          >
            {selected && <circle r={13} fill="none" stroke={color} strokeWidth={2} opacity={0.5} className="animate-pulse-soft" />}
            <circle r={7.5} fill={color} stroke={scheme === 'dark' ? '#08131f' : '#fff'} strokeWidth={2} />
            <circle r={2.6} fill="#fff" opacity={0.9} />
          </g>
        )
      })}
    </g>
  )
}

function RouteShapes({ routes, scheme }) {
  const c = LIVE_COLORS[scheme]
  return (
    <g>
      {routes.map((r) => (
        <g key={r.id}>
          <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(255,255,255,0.12)" strokeWidth={6} strokeLinecap="round" opacity={scheme === 'light' ? 0.5 : 1} />
          <line
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke={r.hot ? C.hot : c.route}
            strokeWidth={2.2}
            strokeDasharray={r.hot ? '5 5' : '8 6'}
            strokeLinecap="round"
            className="animate-dash-flow"
          />
        </g>
      ))}
    </g>
  )
}
const C = { hot: '#f59e0b' }

function DemandPoints({ pickups, destinations, zones, scheme }) {
  const c = LIVE_COLORS[scheme]
  return (
    <g>
      {pickups?.map((p) => {
        const zone = zones.find((z) => z.id === p.areaId)
        const x = p.x ?? zone?.x ?? 500
        const y = p.y ?? zone?.y ?? 320
        return (
          <g key={p.id} transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); p.onClick?.() }}>
            <circle r={8} fill="#f59e0b" fillOpacity={0.3} className="animate-ping-slow" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
            <circle r={4.5} fill="#f59e0b" stroke="#fff" strokeWidth={1.4} />
          </g>
        )
      })}
      {destinations?.map((d) => (
        <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
          <rect x={-4} y={-4} width={8} height={8} rx={1.6} fill={c.destination} stroke="#fff" strokeWidth={1.4} transform="rotate(45)" />
        </g>
      ))}
    </g>
  )
}

function Hotspots({ hotspots, scheme }) {
  return (
    <g>
      {hotspots.map((h) => (
        <g key={h.id} transform={`translate(${h.x} ${h.y})`} opacity={0.5 + (h.intensity / 100) * 0.5}>
          {[0, 1.4, 2.1].map((k, i) => (
            <circle key={i} r={16 + k * 18 * (h.intensity / 100)} fill="none" stroke="#f59e0b" strokeWidth={1.6} opacity={0.7 / (i + 1)} className={i === 0 ? 'animate-ping-slow' : undefined} style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
          ))}
          <circle r={5} fill="#f59e0b" fillOpacity={0.85} />
        </g>
      ))}
    </g>
  )
}

/**
 * Stylized operations map. `scheme` fixes the palette independent of the app
 * theme so the Live Operations command center always renders as a "night map"
 * while the Cities module can use the light variant.
 */
export function MapPanel({
  zones = [],
  drivers = [],
  routes = [],
  pickups = [],
  destinations = [],
  hotspots = [],
  scheme = 'dark',
  selectedDriverId,
  onDriverSelect,
  onZoneHover,
  height = '100%',
  className,
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [layers, setLayers] = useState({ roads: true, blocks: true, zones: true, labels: true })
  const [showLayers, setShowLayers] = useState(false)
  const drag = useRef(null)
  const container = useRef(null)

  const toScreen = useCallback(
    (x, y) => ({ x: x * zoom + pan.x, y: y * zoom + pan.y }),
    [zoom, pan],
  )

  const clampPan = useCallback(
    (next) => {
      const box = container.current?.getBoundingClientRect()
      const w = box?.width || 800
      const h = box?.height || height === '100%' ? 400 : height
      const mw = W * zoom
      const mh = H * zoom
      return {
        x: Math.min(0, Math.max(w - mw, next.x)),
        y: Math.min(0, Math.max(h - mh, next.y)),
      }
    },
    [zoom, height],
  )

  const zoomBy = (factor) => {
    setZoom((z) => {
      const nz = Math.min(2.2, Math.max(0.55, z * factor))
      setPan((p) => clampPan(p))
      return nz
    })
  }

  const recentre = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const startDrag = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDrag = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.current.moved = true
    setPan(clampPan({ x: drag.current.px + dx, y: drag.current.py + dy }))
  }
  const endDrag = (e) => {
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const renderDrivers = drivers.slice(0, 220).map((d) => {
    const s = toScreen(d.x, d.y)
    return { ...d, x: s.x, y: s.y, original: d }
  })

  const legend = [
    { color: LIVE_COLORS[scheme].driverAvailable, label: 'Available' },
    { color: '#3b82f6', label: 'On trip' },
    { color: '#f59e0b', label: 'Ride request' },
    { color: '#ef4444', label: 'Destination' },
  ]

  return (
    <div
      ref={container}
      className={cx('relative flex flex-col overflow-hidden', scheme === 'dark' ? 'bg-navy-950' : 'bg-[#e8eef4]', className)}
      style={{ height }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-h-0 w-full flex-1 touch-none"
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        role="img"
        aria-label="City operations map"
      >
        {layers.roads && (
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            <rect width={W} height={H} fill={LIVE_COLORS[scheme].water} />
            <path d="M 545,-20 C 470,130 590,300 505,470 C 435,610 515,680 545,660 C 500,520 560,340 620,200 C 660,90 640,20 630,-20 Z" fill={LIVE_COLORS[scheme].land} />
            <path d="M 190,470 C 280,520 300,600 340,660" stroke={LIVE_COLORS[scheme].water} strokeWidth={60} fill="none" opacity={0.5} />
            {layers.blocks && <Blocks scheme={scheme} />}
            {layers.zones && <Zones zones={zones} scheme={scheme} labels={layers.labels} hover={onZoneHover} />}
            <Roads scheme={scheme} />
          </g>
        )}
        <RouteShapes
          routes={routes.map((r) => {
            const a = toScreen(r.x1, r.y1)
            const b = toScreen(r.x2, r.y2)
            return { ...r, x1: a.x, y1: a.y, x2: b.x, y2: b.y }
          })}
          scheme={scheme}
        />
        <Hotspots hotspots={hotspots} scheme={scheme} />
        <DemandPoints pickups={pickups} destinations={destinations} zones={zones} scheme={scheme} />
        <DriverMarkers drivers={renderDrivers} scheme={scheme} selectedId={selectedDriverId} onSelect={(d) => onDriverSelect?.(d.original)} />
      </svg>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface/95 shadow-lift backdrop-blur">
          <button onClick={() => zoomBy(1.2)} className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-surface3 hover:text-ink" aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-2 h-px bg-line" />
          <button onClick={() => zoomBy(1 / 1.2)} className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-surface3 hover:text-ink" aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={recentre} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/95 text-ink-soft shadow-lift backdrop-blur transition hover:text-ink" aria-label="Recenter map">
          <Crosshair className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLayers((s) => !s)}
            className={cx('flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/95 text-ink-soft shadow-lift backdrop-blur transition hover:text-ink', showLayers && 'text-ink')}
            aria-label="Map layers"
          >
            <Layers className="h-4 w-4" />
          </button>
          {showLayers && (
            <div className="absolute right-10 top-0 w-40 rounded-lg border border-line bg-surface p-2 shadow-panel">
              {Object.entries(layers).map(([key, on]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium capitalize text-ink-soft hover:bg-surface2">
                  <input type="checkbox" className="accent-brand-600" checked={on} onChange={() => setLayers((l) => ({ ...l, [key]: !on }))} />
                  {key}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-3 rounded-lg border border-line bg-surface/90 px-2.5 py-1.5 backdrop-blur">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
        <span className="h-3 w-px bg-line" />
        <span className="text-[10.5px] font-medium text-ink-faint text-tabular">{zoom.toFixed(2)}×</span>
      </div>
    </div>
  )
}