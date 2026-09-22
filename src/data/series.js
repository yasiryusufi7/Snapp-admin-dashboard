import { makeRng } from '../utils/random'
import { CITIES } from './cities'

/** Builds chart-ready series, deriving where possible from the generated trips. */
export function buildSeries(db) {
  const rng = makeRng(4200)
  const { trips, passengers, drivers } = db
  const DAY = 86400000

  /* trips by hour (rolling 24h) — demand vs supply */
  const tripsByHour = Array.from({ length: 24 }, (_, hour) => {
    const demandBase = 140 + 1500 * Math.max(0, Math.sin(((hour - 7) / 24) * Math.PI * 2) + Math.sin(((hour - 18) / 24) * Math.PI * 2.2))
    const supplyBase = demandBase * (0.78 + 0.06 * Math.sin(hour / 4)) 
    const completed = Math.round((demandBase - supplyBase) * rng.float(0.4, 0.6))
    return {
      hour,
      demand: Math.round(demandBase),
      supply: Math.round(supplyBase),
      completed: Math.round(supplyBase * 0.6 * rng.float(0.9, 1.1)),
    }
  })

  /* daily series over last 30 days */
  const daily = []
  const now = Date.now()
  for (let d = 29; d >= 0; d--) {
    const from = now - d * DAY
    const to = from + DAY
    const dayTrips = trips.filter((t) => t.requestedAt >= from && t.requestedAt < to)
    const completed = dayTrips.filter((t) => t.status === 'completed')
    const cancelled = dayTrips.filter((t) => t.status === 'cancelled')
    const revenue = completed.reduce((s, t) => s + t.fare, 0)
    const commission = completed.reduce((s, t) => s + t.commission, 0)
    const date = new Date(from)
    daily.push({
      date: `${date.toLocaleString('en-AF', { day: '2-digit', month: 'short' })}`,
      iso: from,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue,
      commission,
      distance: Number((completed.reduce((s, t) => s + t.distanceKm, 0)).toFixed(0)),
      pickupTime: Number((rng.float(5.2, 9.4) + (1 / (d + 1))).toFixed(1)),
      onlineDrivers: Math.round(3200 + rng.int(-120, 220) + Math.sin(d / 3) * 180),
    })
  }

  const cityColor = (name) => CITIES.find((c) => c.name === name)?.color || '#1aa28f'
  const revenueByCity = CITIES_KEYS(trips).map((c) => ({
    name: c,
    value: Math.round(trips.filter((t) => t.city === c && t.status === 'completed').reduce((s, t) => s + t.fare, 0)),
    color: cityColor(c),
  }))

  const demandByArea = groupByArea(trips)

  const peakHours = trips
    .reduce((acc, t) => {
      acc[t.hour] = (acc[t.hour] || 0) + 1
      return acc
    }, Array(24).fill(0))
    .map((count, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count }))

  const vehicleUtil = vehicleUtilization(trips)

  const ratingDistribution = buildRatingDist(trips)

  const newPassengers = Array.from({ length: 30 }, (_, i) => {
    const day = i / 30
    return { date: daily[i]?.date ?? `${i}`, value: Math.round(320 + 40 * Math.sin(i / 2) + i * 6 + rng.int(-30, 30)) }
  })

  const activePassengers = Array.from({ length: 30 }, (_, i) => ({
    date: daily[i]?.date ?? `${i}`,
    value: Math.round(24000 + 400 * Math.sin(i / 3.4) + i * 90 + rng.int(-200, 200)),
  }))

  const retentionCohorts = [
    { month: 'Mar', new: 48200, d30: 61, d60: 48, d90: 39 },
    { month: 'Apr', new: 51100, d30: 58, d60: 46, d90: 37 },
    { month: 'May', new: 54600, d30: 63, d60: 50, d90: 41 },
    { month: 'Jun', new: 61200, d30: 66, d60: 53, d90: 45 },
    { month: 'Jul', new: 71800, d30: 69, d60: 57, d90: 49 },
    { month: 'Aug', new: 83200, d30: 71, d60: 60, d90: 52 },
  ]

  const driverEarningsTop = drivers
    .map((d) => ({ name: d.name.split(' ')[0], earnings: d.earnings, rating: d.rating }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 8)

  const driverRatings = [
    { band: '4.8+', count: 62 },
    { band: '4.5–4.7', count: 24 },
    { band: '4.0–4.4', count: 9 },
    { band: '< 4.0', count: 5 },
  ]

  return {
    tripsByHour,
    daily,
    revenueByCity,
    demandByArea,
    peakHours,
    vehicleUtil,
    ratingDistribution,
    newPassengers,
    activePassengers,
    retentionCohorts,
    driverEarningsTop,
    driverRatings,
    passengerCount: passengers.length,
    driverCount: drivers.length,
  }
}

function CITIES_KEYS(trips) {
  return [...new Set(trips.map((t) => t.city))]
}

function groupByArea(trips) {
  const map = new Map()
  for (const t of trips) {
    if (t.status !== 'completed') continue
    const key = t.area
    const entry = map.get(key) || { area: key, cityId: t.cityId, count: 0 }
    entry.count += 1
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 9)
}

function vehicleUtilization(trips) {
  const counts = { economy: 0, executive: 0, xl: 0, eco: 0 }
  for (const t of trips) if (t.status === 'completed') counts[t.vehicleType] = (counts[t.vehicleType] || 0) + 1
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts).map(([k, v]) => ({ name: k, value: Math.round((v / total) * 100) }))
}

function buildRatingDist(trips) {
  const rated = trips.filter((t) => t.status === 'completed' && t.rating)
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const t of rated) dist[Math.round(t.rating)] = (dist[Math.round(t.rating)] || 0) + 1
  return Object.entries(dist).map(([star, count]) => ({ star: Number(star), count })).reverse()
}