import { makeRng } from '../utils/random'
import { CITIES } from './cities'
import {
  MALE_FIRST,
  FEMALE_FIRST,
  LAST_NAMES,
  STREETS,
  VEHICLE_POOL,
  COLORS,
  COMPLAINT_DESCRIPTIONS,
  CANCEL_REASONS,
} from './names'
import { VEHICLE_TYPES } from '../utils/constants'

export const NOW = Date.now()
const DAY = 86400000

function slug(s) {
  return s
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
}

function pointInArea(area, rng, spread = 0.8) {
  const ang = rng.float(0, Math.PI * 2)
  const rad = area.r * spread * Math.sqrt(rng.next())
  return { x: area.x + Math.cos(ang) * rad, y: area.y + Math.sin(ang) * rad * 0.6 }
}

function fullName(rng) {
  const first = rng.pick(rng.chance(0.52) ? MALE_FIRST : FEMALE_FIRST)
  return `${first} ${rng.pick(LAST_NAMES)}`
}

function phone(rng) {
  return `0 5${rng.int(3, 5)} ${rng.int(100, 999)} ${rng.int(10, 99)} ${rng.int(10, 99)}`
}

const RATING_W = [null, null, null, 7, 27, 42, 24]

function weightedRating(rng) {
  return rng.weighted([...RATING_W.map((w, i) => (w ? [i + 0.35 + rng.float(0, 0.3), w] : null)).filter(Boolean)])
}

function areaPointLabel(area, rng) {
  return `${rng.pick(STREETS)} · ${area.name}`
}

/* ------------------------------------------------------------------ */
/* Drivers                                                             */
/* ------------------------------------------------------------------ */
function genVehicles(count, rng) {
  const vehicles = []
  for (let i = 0; i < count; i++) {
    const spec = rng.pick(VEHICLE_POOL)
    const color = rng.pick(COLORS)
    const plate =
      rng.pick(['34', '06', '35', '16', '07']) +
      ' ' +
      rng.pick('ABCDEFGHJKLMPRSTUVYZ') +
      ' ' +
      String(rng.int(1, 999)).padStart(3, '0')
    vehicles.push({
      id: `VEH-${1000 + i}`,
      plate,
      brand: spec.brand,
      type: spec.type,
      year: spec.year,
      color: color.name,
      colorHex: color.hex,
      seats: spec.type === 'xl' ? 7 : 4,
      active: rng.chance(0.88),
      documents: [
        { name: 'Registration', status: rng.weighted([['verified', 88], ['pending', 5], ['expired', 4], ['review', 3]]) },
        { name: 'Insurance', status: rng.weighted([['verified', 86], ['expired', 8], ['pending', 4], ['review', 2]]) },
        { name: 'Inspection', status: rng.weighted([['verified', 90], ['pending', 4], ['expired', 4], ['review', 2]]) },
      ],
      lastService: rng.int(2, 180),
      nextService: rng.int(7, 220),
    })
  }
  return vehicles
}

function genDrivers(count, rng) {
  const drivers = []
  const statusW = [
    ['available', 42],
    ['busy', 30],
    ['break', 6],
    ['offline', 17],
    ['suspended', 5],
  ]
  for (let i = 0; i < count; i++) {
    const city = rng.pick(CITIES)
    const area = rng.pick(city.areas)
    const status = rng.weighted(statusW)
    const verification = rng.weighted([
      ['verified', 82],
      ['review', 6],
      ['pending', 7],
      ['rejected', 3],
      ['expired', 2],
    ])
    const joined = NOW - rng.int(90, 1400) * DAY
    const trips = verification === 'verified' ? rng.int(180, 7800) : rng.int(0, 400)
    const rating = weightedRating(rng)
    drivers.push({
      id: `DRV-${3100 + i}`,
      name: fullName(rng),
      phone: phone(rng),
      email: `${slug(fullName(rng)).split(' ').join('.')}@mail.com`,
      cityId: city.id,
      city: city.name,
      areaId: area.id,
      area: area.name,
      location: pointInArea(area, rng),
      vehicle: null, // filled below
      vehicleType: null,
      status,
      verification,
      rating,
      rides: trips,
      cancelled: Math.round(trips * rng.float(0.02, 0.09)),
      earnings: Math.round(trips * 620) + rng.int(1000, 90000),
      completedRides: trips,
      joined,
      lastActive: status === 'offline' || status === 'suspended' ? NOW - rng.int(1, 400) * 3600000 : NOW - rng.int(1, 40) * 60000,
      onlineHours: Math.round(rng.int(120, 920) * rng.float(0.6, 1)),
      acceptanceRate: rng.int(72, 99),
      currentTripId: status === 'busy' ? null : null,
      currentTrip: status === 'busy',
    })
  }
  return drivers
}

/* ------------------------------------------------------------------ */
/* Passengers                                                          */
/* ------------------------------------------------------------------ */
function genPassengers(count, rng) {
  const passengers = []
  for (let i = 0; i < count; i++) {
    const city = rng.pick(CITIES)
    const area = rng.pick(city.areas)
    const joined = NOW - rng.int(5, 1500) * DAY
    const trips = rng.int(1, 340)
    const status = rng.weighted([['active', 90], ['suspended', 8], ['banned', 2]])
    const name = fullName(rng)
    passengers.push({
      id: `PAX-${8100 + i}`,
      name,
      phone: phone(rng),
      email: `${slug(name).split(' ').join('.')}@gmail.com`,
      cityId: city.id,
      city: city.name,
      areaId: area.id,
      area: area.name,
      trips,
      completed: Math.round(trips * rng.float(0.86, 0.98)),
      totalSpent: Math.round(trips * rng.int(150, 460)),
      wallet: rng.int(0, 4200),
      status,
      rating: weightedRating(rng),
      joined,
      lastActive: NOW - rng.int(1, 30) * 3600000,
      favoriteRoutes: rng.int(0, 6),
    })
  }
  return passengers
}

/* ------------------------------------------------------------------ */
/* Trips                                                               */
/* ------------------------------------------------------------------ */
function tripFare(areaCity, distKm, durationMin, rng, vehicleType = 'economy') {
  const peak = rng.chance(0.32) ? 1.15 : 1
  const night = rng.chance(0.18) ? 1.25 : 1
  const base = 42 + (vehicleType === 'executive' ? 68 : vehicleType === 'xl' ? 56 : vehicleType === 'eco' ? 36 : 0)
  const perKm = 17.5 + (vehicleType === 'executive' ? 16 : vehicleType === 'xl' ? 8 : vehicleType === 'eco' ? 2 : 0)
  const perMin = 3.2 + (vehicleType === 'executive' ? 2.2 : 0.4)
  const raw = (base + perKm * distKm + perMin * durationMin) * peak * night
  const fare = Math.round((raw / 5) * 5)
  const commission = Math.round(fare * rng.float(0.155, 0.21))
  return { fare, commission, peak, night }
}

function genTrips(drivers, passengers, rng) {
  const trips = []
  let id = 42000
  const cityPassengers = (cityId) => passengers.filter((p) => p.cityId === cityId)
  const busyDrivers = drivers.filter((d) => d.status === 'busy')

  for (let day = 29; day >= 0; day--) {
    const date = NOW - day * DAY
    const isToday = day === 0
    const weekday = new Date(date).getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.35 : 1
    const count = Math.round((34 + Math.sin(day / 3.4) * 12 + rng.int(-6, 10)) * weekendBoost)

    for (let i = 0; i < count; i++) {
      const city = rng.pick(CITIES)
      const area = rng.pick(city.areas)
      const destArea = rng.pick(city.areas)
      const paxPool = cityPassengers(city.id)
      if (!paxPool.length) continue
      const passenger = rng.pick(paxPool)
      const driver = rng.pick(drivers)
      const vehicleType = driver.vehicleType || 'economy'
      const distKm = Number(rng.float(1.6, 26).toFixed(1))
      const speed = rng.float(21, 32)
      const durationMin = Math.round((distKm / speed) * 60)
      const { fare, commission, peak, night } = tripFare(city, distKm, durationMin, rng, vehicleType)
      const requestedAt = date + rng.int(0, 18) * 3600000 + rng.int(0, 59) * 60000
      const hour = new Date(requestedAt).getHours()

      let status
      let paymentStatus = 'pending'
      let paymentMethod
      let rating = null
      let cancelledAt = null
      let startedAt = null
      let completedAt = null
      let cancelReason = null

      if (isToday) {
        status = rng.weighted([
          ['completed', 52],
          ['in_progress', 12],
          ['arriving', 9],
          ['arrived', 5],
          ['accepted', 4],
          ['cancelled', 12],
          ['failed', 3],
          ['requested', 3],
        ])
      } else {
        status = rng.weighted([
          ['completed', 82],
          ['cancelled', 12],
          ['failed', 2],
          ['in_progress', 0],
          ['completed', 0],
        ])
        if (status === 'failed') status = 'cancelled'
      }

      if (status === 'in_progress') {
        startedAt = requestedAt + rng.int(2, 8) * 60000
      } else if (status === 'completed' || status === 'arrived' || status === 'accepted') {
        startedAt = requestedAt + rng.int(2, 10) * 60000
      }
      if (status === 'completed') {
        completedAt = startedAt + durationMin * 60000
        paymentStatus = rng.weighted([['completed', 92], ['refunded', 4], ['pending', 4]])
        rating = weightedRating(rng)
      }
      if (status === 'cancelled') {
        cancelledAt = requestedAt + rng.int(1, 20) * 60000
        cancelReason = rng.pick(CANCEL_REASONS)
        paymentStatus = 'cancelled'
      }

      paymentMethod = rng.weighted([['card', 48], ['wallet', 32], ['cash', 20]])

      trips.push({
        id: `TRP-${id++}`,
        passengerId: passenger.id,
        passenger: passenger.name,
        driverId: driver.id,
        driver: driver.name,
        vehiclePlate: driver.plate || '34 X 0000',
        vehicleType,
        cityId: city.id,
        city: city.name,
        areaId: area.id,
        area: area.name,
        pickup: areaPointLabel(area, rng),
        destination: areaPointLabel(destArea, rng),
        pickupPoint: area === destArea ? { x: area.x - rng.int(20, 80), y: area.y - rng.int(10, 60) } : area,
        destPoint: destArea,
        distanceKm: distKm,
        durationMin,
        fare,
        commission,
        peak: !!peak,
        night: !!night,
        paymentMethod,
        paymentStatus,
        status,
        rating,
        requestedAt,
        startedAt,
        completedAt,
        cancelledAt,
        cancelReason,
        hour,
      })
    }
  }

  // Bind a handful of current trips to busy drivers for the live map
  const currentTrips = trips.filter((t) => ['in_progress', 'arriving', 'arrived', 'accepted'].includes(t.status))
  let ci = 0
  for (const d of busyDrivers) {
    if (ci >= currentTrips.length) break
    const trip = currentTrips[ci]
    d.currentTripId = trip.id
    d.location = { ...trip.pickupPoint, y: trip.pickupPoint.y + rng.int(5, 60) }
    trip.lineId = d.id
    ci++
  }
  return trips
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */
function genBookings(passengers, rng) {
  const bookings = []
  for (let i = 0; i < 54; i++) {
    const pax = rng.pick(passengers)
    const city = rng.pick(CITIES)
    const area = rng.pick(city.areas)
    const dest = rng.pick(city.areas)
    const status = rng.weighted([['scheduled', 62], ['assigned', 20], ['pending', 12], ['cancelled', 6]])
    const fare = Math.round(rng.float(85, 480) / 5) * 5
    bookings.push({
      id: `BKG-${7200 + i}`,
      passengerId: pax.id,
      passenger: pax.name,
      driverId: status === 'assigned' ? null : null,
      driver: null,
      cityId: city.id,
      city: city.name,
      areaId: area.id,
      pickup: areaPointLabel(area, rng),
      destination: areaPointLabel(dest, rng),
      scheduledFor: NOW + rng.int(1, 44) * 3600000,
      vehicleType: rng.pick(VEHICLE_TYPES),
      fare,
      status,
      paymentStatus: status === 'cancelled' ? 'cancelled' : rng.weighted([['prepaid', 55], ['pending', 45]]),
      passengers: rng.int(1, 4),
      luggage: rng.chance(0.2),
    })
  }
  return bookings
}

/* ------------------------------------------------------------------ */
/* Payments + settlements                                              */
/* ------------------------------------------------------------------ */
function genPayments(trips, rng) {
  const payments = trips
    .filter((t) => t.paymentStatus === 'completed')
    .slice()
    .sort((a, b) => b.requestedAt - a.requestedAt)
    .map((t, i) => ({
      id: `PAY-${33000 - i}`,
      ref: `CH-${String(260000 + i * 7)}`,
      userId: t.passengerId,
      userName: t.passenger,
      tripId: t.id,
      amount: t.fare,
      commission: t.commission,
      fee: Math.round(t.fare * 0.029),
      method: t.paymentMethod,
      status: 'completed',
      createdAt: t.requestedAt,
      city: t.city,
    }))
  return payments
}

function genSettlements(drivers, rng) {
  const settlements = []
  for (const d of drivers) {
    const commission = Math.round(d.earnings * rng.float(0.14, 0.2))
    const pending = rng.int(1200, 42000)
    settlements.push({
      driverId: d.id,
      driver: d.name,
      wallet: d.earnings - commission - pending,
      earnings: d.earnings,
      commission,
      pending,
      settled: d.earnings - commission - pending,
      withdrawals: rng.int(0, 12),
    })
  }
  return settlements
}

/* ------------------------------------------------------------------ */
/* Complaints                                                          */
/* ------------------------------------------------------------------ */
function genComplaints(passengers, drivers, trips, rng) {
  const categories = [
    'driver_behavior', 'passenger_behavior', 'fare_dispute', 'lost_item',
    'payment_issue', 'trip_issue', 'technical', 'other',
  ]
  const complaints = []
  const statusW = [
    ['new', 18],
    ['in_review', 16],
    ['assigned', 14],
    ['waiting', 14],
    ['resolved', 26],
    ['closed', 12],
  ]
  for (let i = 0; i < 46; i++) {
    const pax = rng.pick(passengers)
    const driver = rng.pick(drivers)
    const trip = rng.pick(trips.filter((t) => t.passengerId === pax.id) || [trips[0]])
    const category = rng.pick(categories)
    const status = rng.weighted(statusW)
    const created = NOW - rng.int(1, 30) * DAY
    const priority = rng.weighted([['low', 30], ['medium', 42], ['high', 20], ['critical', 8]])
    complaints.push({
      id: `CMP-${1200 + i}`,
      ticket: `SUP-${9400 + i}`,
      passengerId: pax.id,
      passenger: pax.name,
      driverId: driver.id,
      driver: driver.name,
      tripId: trip.id,
      category,
      subject: rng.pick(COMPLAINT_DESCRIPTIONS),
      description: rng.pick(COMPLAINT_DESCRIPTIONS),
      status,
      priority,
      created,
      updated: created + rng.int(1, 400) * 3600000,
      assignedTo: rng.chance(0.6) ? rng.pick(['Ahmad Karimi', 'Farid Rahimi', 'Maryam Noori', 'Habib Safi']) : null,
      resolution: status === 'resolved' || status === 'closed' ? 'Driver warned & trip fare partially refunded as goodwill.' : null,
      internalNotes: rng.chance(0.6) ? 'Awaiting driver statement; camera footage requested.' : null,
      attachments: rng.chance(0.3) ? 2 : 0,
    })
  }
  return complaints.sort((a, b) => b.created - a.created)
}

/* ------------------------------------------------------------------ */
/* Campaigns / notifications                                           */
/* ------------------------------------------------------------------ */
function genCampaigns(rng) {
  const data = [
    ['First Ride 50%', 'percent', 50, 420, 'AXM50', 30000, 4800],
    ['Weekend Metro Surge', 'percent', 25, 120, 'METRO25', 9000, 1350],
    ['Corporate Q3 Program', 'flat', 80, 75, 'CORP80', 4000, 2100],
    ['Airport Express', 'percent', 30, 0, 'APT30', 6500, 980],
    ['New City Launch — Herat', 'percent', 40, 0, 'HER40', 2500, 610],
    ['Loyalty 12th Ride', 'flat', 100, 0, 'Loyal12', 12000, 3060],
    ['Night Owl Discount', 'percent', 15, 0, 'OWL15', 10800, 940],
    ['Electric Green', 'percent', 20, 0, 'EV20', 3100, 520],
  ]
  return data.map(([name, type, value, daysLeft, code, budget, redemptions], i) => {
    const started = NOW - rng.int(2, 40) * DAY
    const active = daysLeft > 0
    const end = active ? NOW + daysLeft * DAY : started + rng.int(5, 30) * DAY
    const status = active ? 'active' : 'ended'
    const cost = redemptions * (type === 'percent' ? value * 1.6 : value)
    const revenue = redemptions * rng.int(380, 620)
    return {
      id: `CMPG-${600 + i}`,
      name,
      discountType: type,
      discountValue: value,
      couponCode: code,
      startDate: started,
      endDate: end,
      usageLimit: budget,
      redemptions,
      cities: rng.pick([[['kbl'], ['kbl', 'mzr']], [['kbl']], [['mzr', 'her']], [['her', 'kdh']], [['jal']]]),
      eligibleUsers: 'all',
      status,
      cost: Math.round(cost),
      revenue: Math.round(revenue),
      budget,
    }
  })
}

function genNotifications(rng) {
  const rows = [
    ['Driver App Update 4.6 — go-live', 'drivers', 'push', 482000, 468100, 411090],
    ['Peak-hour surge advisory · Shar-e-Naw', 'drivers', 'operational', 6210, 5422, 3840],
    ['New fare structure — Herat', 'drivers', 'announcement', 2930, 2720, 2111],
    ['Rider loyalty: 12th ride free', 'passengers', 'promo', 248000, 231000, 203500],
    ['Scheduled maintenance window', 'all', 'system', 1204000, 1140000, 909000],
    ['Referral program winter bonus', 'passengers', 'promo', 182000, 161200, 128900],
    ['Document expiry reminder wave', 'drivers', 'operational', 14100, 13980, 9020],
    ['Late-night service expansion', 'passengers', 'announcement', 96000, 88200, 71000],
    ['Airport fee transparency notice', 'all', 'policy', 74000, 69000, 41000],
    ['Compliance training completion', 'drivers', 'announcement', 12000, 11880, 7600],
  ]
  return rows.map(([title, audience, type, sent, delivered, read], i) => {
    const createdAt = NOW - rng.int(2, 45) * DAY
    let status = 'sent'
    if (i === 1) status = 'scheduled'
    if (rng.chance(0.15)) status = rng.pick(['scheduled', 'draft'])
    return {
      id: `NTC-${500 + i}`,
      title,
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.',
      audience,
      type,
      sent,
      delivered,
      read,
      status,
      createdAt,
      scheduledFor: status === 'scheduled' ? NOW + rng.int(2, 24) * 3600000 : null,
      creator: rng.pick(['Ahmad Karimi', 'Maryam Noori', 'Habib Safi']),
    }
  })
}

/* ------------------------------------------------------------------ */
/* Fare + commission rules                                             */
/* ------------------------------------------------------------------ */
function genFareRules(rng) {
  const rules = []
  for (const city of CITIES) {
    for (const v of VEHICLE_TYPES) {
      const base = { economy: 42, executive: 110, xl: 96, eco: 38 }[v]
      rules.push({
        id: `FR-${city.id}-${v}`,
        cityId: city.id,
        city: city.name,
        vehicleType: v,
        base,
        perKm: { economy: 17.5, executive: 33.5, xl: 25, eco: 19 }[v] + (city.id === 'kbl' ? 1.2 : 0),
        perMin: { economy: 3.2, executive: 5.4, xl: 4.2, eco: 3.6 }[v] + (city.id === 'kbl' ? 0.2 : 0),
        minimum: { economy: 70, executive: 150, xl: 130, eco: 64 }[v],
        waitingPerMin: 1.1,
        nightMultiplier: 1.25,
        nightStart: 24,
        nightEnd: 6,
        peakMultiplier: 1.15,
        peakStart: 18,
        peakEnd: 22,
        airportSurcharge: city.id === 'kbl' ? 45 : city.id === 'kdh' ? 30 : city.id === 'her' ? 25 : 20,
        cancellationFee: { economy: 25, executive: 60, xl: 45, eco: 22 }[v],
        status: 'active',
        updatedAt: NOW - rng.int(2, 90) * DAY,
      })
    }
  }
  return rules
}

function genCommissionRules(rng) {
  const rules = []
  rules.push({
    id: 'COM-001',
    name: 'Global default commission',
    scope: 'global',
    scopeLabel: 'All cities & drivers',
    rate: 0.18,
    effectiveFrom: NOW - 180 * DAY,
    effectiveUntil: null,
    status: 'active',
    conflict: false,
  })
  rules.push({
    id: 'COM-002',
    name: 'Kabul standard',
    scope: 'city',
    scopeLabel: 'Kabul',
    rate: 0.20,
    effectiveFrom: NOW - 60 * DAY,
    effectiveUntil: null,
    status: 'active',
    conflict: false,
  })
  rules.push({
    id: 'COM-003',
    name: 'Herat launch incentive',
    scope: 'city',
    scopeLabel: 'Herat',
    rate: 0.14,
    effectiveFrom: NOW - 30 * DAY,
    effectiveUntil: NOW + 60 * DAY,
    status: 'active',
    conflict: false,
  })
  rules.push({
    id: 'COM-004',
    name: 'Electric fleet promotion',
    scope: 'vehicle',
    scopeLabel: 'Vehicle type: Electric',
    rate: 0.13,
    effectiveFrom: NOW - 20 * DAY,
    effectiveUntil: NOW + 40 * DAY,
    status: 'active',
    conflict: false,
  })
  rules.push({
    id: 'COM-005',
    name: 'Top earner program',
    scope: 'driver',
    scopeLabel: '98 drivers · rating > 4.85',
    rate: 0.155,
    effectiveFrom: NOW - 15 * DAY,
    effectiveUntil: NOW + 30 * DAY,
    status: 'active',
    conflict: true,
  })
  return rules
}

/* ------------------------------------------------------------------ */
/* Audit / exports                                                     */
/* ------------------------------------------------------------------ */
function genAudit(rng) {
  const actors = [
    { name: 'Ahmad Karimi', role: 'super_admin' },
    { name: 'Farid Rahimi', role: 'operations_manager' },
    { name: 'Maryam Noori', role: 'finance_manager' },
    { name: 'Habib Safi', role: 'dispatcher' },
  ]
  const actions = [
    ['driver.approved', 'Drivers', 'DRV-3412'],
    ['driver.suspended', 'Drivers', 'DRV-3721'],
    ['fare_rule.updated', 'Fare Rules', 'FR-kbl-economy'],
    ['commission.updated', 'Commission Rules', 'COM-002'],
    ['payment.refunded', 'Payments', 'PAY-32540'],
    ['role.updated', 'RBAC', 'operations_manager'],
    ['settings.email_changed', 'Settings', 'smtp relay'],
    ['driver.document_verified', 'Drivers', 'DRV-3107'],
    ['report.exported', 'Export Center', 'trips-2026-08'],
    ['campaign.published', 'Campaigns', 'CMPG-603'],
  ]
  const rows = []
  for (let i = 0; i < 96; i++) {
    const actor = rng.pick(actors)
    const [action, module, resource] = rng.pick(actions)
    rows.push({
      id: `AUD-${8000 + i}`,
      actor: actor.name,
      role: actor.role,
      action,
      module,
      resource: rng.pick([resource, resource.replace('DRV-', 'DRV-'), resource.toLowerCase()]),
      outcome: rng.weighted([['success', 92], ['denied', 5], ['error', 3]]),
      ip: `185.${rng.int(1, 220)}.${rng.int(0, 255)}.${rng.int(1, 254)}`,
      ts: NOW - rng.int(1, 14) * DAY * rng.float(0.05, 1),
    })
  }
  return rows.sort((a, b) => b.ts - a.ts)
}

function genExports(rng) {
  const defs = [
    ['Trips — August', 'trips', 'CSV'],
    ['Driver performance Q3', 'drivers', 'Excel'],
    ['Passenger list — Kabul', 'passengers', 'CSV'],
    ['Revenue by city — July', 'revenue', 'PDF'],
    ['Settlement ledger — week 34', 'settlements', 'Excel'],
    ['Complaints backlog', 'complaints', 'CSV'],
    ['Payment failures — 30d', 'payments', 'CSV'],
    ['Analytics weekly digest', 'analytics', 'PDF'],
    ['Driver churn analysis', 'drivers', 'Excel'],
    ['Campaign ROI matrix', 'campaigns', 'Excel'],
  ]
  const statuses = ['completed', 'completed', 'completed', 'processing', 'completed', 'failed', 'completed', 'processing', 'completed', 'queued']
  return defs.map(([name, kind, format], i) => ({
    id: `EXP-${500 + i}`,
    name,
    kind,
    format,
    requestedBy: rng.pick(['Ahmad Karimi', 'Maryam Noori', 'Habib Safi', 'Farid Rahimi']),
    date: NOW - rng.int(2, 40) * DAY,
    rows: rng.int(1200, 486000),
    size: `${rng.float(1.2, 48).toFixed(1)} MB`,
    status: statuses[i],
  }))
}

/* ------------------------------------------------------------------ */
/* Live operations extras                                              */
/* ------------------------------------------------------------------ */
function genLiveExtras(trips, drivers, passengers, rng) {
  const inProgress = trips.filter((t) => t.status === 'in_progress').slice(0, 14)
  const requests = passengers.slice(0, 14).map((p, i) => {
    const city = rng.pick(CITIES)
    const area = rng.pick(city.areas)
    const areaName = area.name
    const dest = rng.pick(city.areas)
    return {
      id: `REQ-${9000 + i}`,
      passenger: p.name,
      rating: p.rating,
      pickup: `Near ${rng.pick(STREETS)} · ${areaName}`,
      pickupArea: area,
      destination: dest.name,
      vehicleType: rng.pick(VEHICLE_TYPES),
      distanceKm: Number(rng.float(1.5, 12).toFixed(1)),
      estFare: Math.round(rng.float(60, 320) / 5) * 5,
      ageSec: rng.int(20, 230),
      demand: rng.pick(['low', 'normal', 'high']),
      cityId: city.id,
    }
  })

  const hotspots = CITIES[0].areas.map((a, i) => ({
    id: `HS-${i}`,
    cityId: CITIES[0].id,
    name: a.name,
    x: a.x,
    y: a.y,
    intensity: rng.int(55, 100),
    pending: rng.int(6, 40),
    surge: rng.chance(0.5) ? rng.float(1.1, 1.6) : null,
  }))

  const alerts = [
    { id: 'AL-1', level: 'critical', title: 'Surge pricing triggered', detail: 'Shar-e-Naw · 1.4× multiplier', ts: NOW - 4 * 60000 },
    { id: 'AL-2', level: 'high', title: 'Low supply detected', detail: 'Dasht-e-Shor · 3 drivers / 41 requests', ts: NOW - 9 * 60000 },
    { id: 'AL-3', level: 'warning', title: 'Vehicle inspection overdue', detail: '24 vehicles · reminder sent', ts: NOW - 22 * 60000 },
    { id: 'AL-4', level: 'high', title: 'Unusually high cancellation', detail: 'Dashte Barchi · 18% last 30 min', ts: NOW - 31 * 60000 },
    { id: 'AL-5', level: 'info', title: 'New rider cohort spikes', detail: '+240% sign-ups since 08:00', ts: NOW - 48 * 60000 },
    { id: 'AL-6', level: 'warning', title: 'Driver app crash reports', detail: 'Android 14 · 0.4% of sessions', ts: NOW - 70 * 60000 },
  ]

  return { requests, hotspots, alerts, inProgress }
}

export { genVehicles, genDrivers, genPassengers, genTrips, genBookings, genPayments, genSettlements, genComplaints, genCampaigns, genNotifications, genFareRules, genCommissionRules, genAudit, genExports, genLiveExtras }