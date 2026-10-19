import { makeRng } from '../utils/random'
import {
  genVehicles,
  genDrivers,
  genPassengers,
  genTrips,
  genBookings,
  genPayments,
  genSettlements,
  genComplaints,
  genCampaigns,
  genNotifications,
  genDriverRegistrations,
  genFareRules,
  genCommissionRules,
  genAudit,
  genExports,
  genLiveExtras,
} from './generate'
import { buildSeries } from './series'
import { CITIES } from './cities'

const DAY = 86400000

function buildDatabase() {
  const db = {}

  const vehicles = genVehicles(132, makeRng(101))
  const drivers = genDrivers(132, makeRng(202))
  drivers.forEach((d, i) => {
    const v = vehicles[i % vehicles.length]
    d.vehicle = v
    d.plate = v.plate
    d.vehicleType = v.type
    d.vehicleStatus = v.active ? 'active' : 'idle'
  })
  db.vehicles = vehicles
  db.drivers = drivers

  db.passengers = genPassengers(168, makeRng(303))

  const trips = genTrips(drivers, db.passengers, makeRng(404))
  db.trips = trips.sort((a, b) => b.requestedAt - a.requestedAt)

  db.bookings = genBookings(db.passengers, makeRng(505)).sort((a, b) => a.scheduledFor - b.scheduledFor)
  db.payments = genPayments(db.trips, makeRng(606))
  db.settlements = genSettlements(drivers, makeRng(707))
  db.complaints = genComplaints(db.passengers, drivers, db.trips, makeRng(808))
  db.campaigns = genCampaigns(makeRng(909))
  db.notifications = genNotifications(makeRng(1010))
  db.registrations = genDriverRegistrations(makeRng(1616))
  db.notifications.unshift(
    ...db.registrations.map((r) => ({
      id: `NTC-${r.id}`,
      kind: 'driver_registration',
      registrationId: r.id,
      title: `New driver registration · ${r.name}`,
      body: `${r.licenseNo} · ${r.city} · ${r.vehicle.brand} ${r.vehicle.type} (${r.vehicle.year})`,
      applicant: r.name,
      city: r.city,
      vehicleSummary: `${r.vehicle.brand} · ${r.vehicle.type}`,
      docsTotal: r.documents.length,
      docsVerified: r.documents.filter((d) => d.status === 'verified').length,
      audience: 'drivers',
      type: 'registration',
      sent: 0,
      delivered: 0,
      read: 0,
      status: r.status === 'declined' ? 'declined' : 'pending',
      driverId: null,
      createdAt: r.submittedAt,
      reviewedAt: r.reviewedAt,
      scheduledFor: null,
      creator: 'Driver app',
    })),
  )
  db.fareRules = genFareRules(makeRng(1111))
  db.commissionRules = genCommissionRules(makeRng(1212))
  db.audit = genAudit(makeRng(1313))
  db.exports = genExports(makeRng(1414))

  const live = genLiveExtras(db.trips, drivers, db.passengers, makeRng(1515))
  db.live = live
  db.hotspots = live.hotspots
  db.alerts = live.alerts

  db.cities = CITIES

  /* ------- derived helpers / lookups ------- */
  db.byDriver = Object.fromEntries(drivers.map((d) => [d.id, d]))
  db.byPassenger = Object.fromEntries(db.passengers.map((p) => [p.id, p]))
  db.byVehicle = Object.fromEntries(vehicles.map((v) => [v.id, v]))
  db.byTrip = Object.fromEntries(db.trips.map((t) => [t.id, t]))
  db.byRegistration = Object.fromEntries(db.registrations.map((r) => [r.id, r]))

  /* ------- aggregated slice metrics (visible dataset) ------- */
  const completed = db.trips.filter((t) => t.status === 'completed')
  db.slice = {
    trips: db.trips.length,
    completed: completed.length,
    cancelled: db.trips.filter((t) => t.status === 'cancelled').length,
    inProgress: db.trips.filter((t) => t.status === 'in_progress').length,
    revenue: completed.reduce((s, t) => s + t.fare, 0),
    commission: completed.reduce((s, t) => s + t.commission, 0),
    onlineDrivers: drivers.filter((d) => ['available', 'busy', 'break'].includes(d.status)).length,
    available: drivers.filter((d) => d.status === 'available').length,
    busy: drivers.filter((d) => d.status === 'busy').length,
  }

  /* ------- platform-scale KPIs for command views ------- */
  db.kpis = {
    activeTrips: 1248,
    onlineDrivers: 3821,
    availableDrivers: 1942,
    busyDrivers: 1879,
    pendingRequests: 326,
    openComplaints: 412,
    totalPassengers: 482140,
    totalDrivers: 9410,
    totalVehicles: 9126,
    revenueToday: 1248500,
    revenue30d: 31240000,
    commissionToday: 238400,
    commission30d: 5920000,
    totalTripsToday: 15420,
    totalTrips30d: 428000,
    pendingBookings: 318,
    activeInLastHour: 4860,
    avgPickupTime: 6.4,
    avgTripKm: 7.8,
    cancellationRate: 8.2,
    utilization: 64.5,
  }

  /* ------- chart series ------- */
  db.series = buildSeries(db)

  return db
}

export const db = buildDatabase()

export function getDriver(id) {
  return db.byDriver[id] || null
}
export function getPassenger(id) {
  return db.byPassenger[id] || null
}
export function getTrip(id) {
  return db.byTrip[id] || null
}

/** Trips belonging to a passenger, newest first. */
export function tripsForPassenger(passengerId) {
  return db.trips.filter((t) => t.passengerId === passengerId)
}

/** Trips belonging to a driver, newest first. */
export function tripsForDriver(driverId) {
  return db.trips.filter((t) => t.driverId === driverId)
}