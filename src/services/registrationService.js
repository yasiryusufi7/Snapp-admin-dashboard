import { makeService, request } from './api'
import { db } from '../data/db'
import { CITIES, getCity, getArea } from '../data/cities'
import { VEHICLE_POOL, COLORS, MALE_FIRST, FEMALE_FIRST, LAST_NAMES } from '../data/names'

const base = makeService({
  data: db.registrations,
  searchFields: ['name', 'phone', 'email', 'city', 'id', 'plate'],
  defaultSort: 'submittedAt',
  defaultDir: 'desc',
})

const DEFAULT_DOCUMENTS = ['Driving License', 'Vehicle Registration', 'Insurance Certificate', 'Profile Photo']

function uniqueId(prefix, list, start) {
  const taken = new Set(list.map((x) => x.id))
  let n = start
  while (taken.has(`${prefix}${n}`)) n++
  return `${prefix}${n}`
}

function makePlate(seed) {
  const letters = 'ABCDEFGHJKLMPRSTUVYZ'
  const prefixes = ['34', '06', '35', '16', '07']
  return `${prefixes[seed % prefixes.length]} ${letters[(seed * 7) % letters.length]} ${String((seed * 37) % 999).padStart(3, '0')}`
}

function registrationNotification(reg) {
  return {
    id: `NTC-${reg.id}`,
    kind: 'driver_registration',
    registrationId: reg.id,
    title: `New driver registration · ${reg.name}`,
    body: `${reg.licenseNo} · ${reg.city} · ${reg.vehicle.brand} ${reg.vehicle.type} (${reg.vehicle.year})`,
    applicant: reg.name,
    city: reg.city,
    vehicleSummary: `${reg.vehicle.brand} · ${reg.vehicle.type}`,
    docsTotal: reg.documents.length,
    docsVerified: reg.documents.filter((d) => d.status === 'verified').length,
    audience: 'drivers',
    type: 'registration',
    sent: 0,
    delivered: 0,
    read: 0,
    status: reg.status === 'approved' ? 'approved' : reg.status === 'declined' ? 'declined' : 'pending',
    driverId: reg.driverId || null,
    createdAt: reg.submittedAt,
    reviewedAt: reg.reviewedAt || null,
    scheduledFor: null,
    creator: 'Driver app',
  }
}

function syncNotification(reg) {
  const n = db.notifications.find((x) => x.kind === 'driver_registration' && x.registrationId === reg.id)
  if (!n) return
  n.status = reg.status === 'approved' ? 'approved' : reg.status === 'declined' ? 'declined' : 'pending'
  n.docsVerified = reg.documents.filter((d) => d.status === 'verified').length
  n.reviewedAt = reg.reviewedAt || null
  n.city = reg.city
  n.driverId = reg.driverId || null
}

function writeAudit(action, resource) {
  db.audit.unshift({
    id: `AUD-${9000 + db.audit.length}`,
    actor: 'Ahmad Karimi',
    role: 'super_admin',
    action,
    module: 'Drivers',
    resource,
    outcome: 'success',
    ip: '185.23.44.7',
    ts: Date.now(),
  })
}

export const registrationService = {
  list: base.list,
  get: base.get,

  /**
   * Entry point for the frontend driver-registration form.
   * Creates a pending application and pushes a request into the
   * Notifications inbox for admin review.
   */
  submit(payload = {}) {
    return request(() => {
      const seed = db.registrations.length
      const city = getCity(payload.cityId) || CITIES[0]
      const area = city.areas.find((a) => a.id === payload.areaId) || city.areas[0]
      const spec = payload.vehicle?.brand ? payload.vehicle : VEHICLE_POOL[seed % VEHICLE_POOL.length]
      const color = COLORS[seed % COLORS.length]
      const firstPool = seed % 2 ? MALE_FIRST : FEMALE_FIRST
      const name = payload.name || `${firstPool[seed % firstPool.length]} ${LAST_NAMES[seed % LAST_NAMES.length]}`

      const reg = {
        id: uniqueId('REG-', db.registrations, 1000 + seed),
        name,
        phone: payload.phone || `0 5${(seed % 3) + 3} ${100 + (seed % 900)} ${10 + (seed % 90)} ${10 + (seed % 90)}`,
        email: payload.email || `${name.toLowerCase().replace(/\s+/g, '.')}@mail.com`,
        licenseNo: payload.licenseNo || `AF-${10 + (seed % 90)}-${100000 + seed * 137}`,
        experienceYears: payload.experienceYears || (seed % 12) + 1,
        cityId: city.id,
        city: city.name,
        areaId: area.id,
        area: area.name,
        vehicle: {
          brand: spec.brand,
          type: spec.type,
          year: spec.year || 2022,
          color: spec.color || color.name,
          colorHex: spec.colorHex || color.hex,
          plate: spec.plate || makePlate(seed + 17),
          seats: spec.seats || (spec.type === 'xl' ? 7 : 4),
        },
        documents: (payload.documents?.length ? payload.documents : DEFAULT_DOCUMENTS).map((d) => ({
          name: typeof d === 'string' ? d : d.name,
          status: typeof d === 'string' ? 'pending' : d.status || 'pending',
        })),
        status: 'pending',
        submittedAt: Date.now(),
        reviewer: null,
        reviewedAt: null,
        declineReason: null,
        driverId: null,
        source: payload.source || 'driver-app',
      }

      db.registrations.unshift(reg)
      db.byRegistration[reg.id] = reg
      db.notifications.unshift(registrationNotification(reg))
      return reg
    }, 460)
  },

  /** Demo trigger mirroring what the frontend driver app sends. */
  simulate() {
    return this.submit({})
  },

  verifyDocument(regId, docName) {
    return request(() => {
      const reg = db.registrations.find((r) => r.id === regId)
      if (!reg) throw new Error('Registration not found')
      const doc = reg.documents.find((d) => d.name === docName)
      if (!doc) throw new Error('Document not found')
      doc.status = 'verified'
      syncNotification(reg)
      writeAudit('driver.document_verified', reg.id)
      return { id: reg.id, doc: docName, status: doc.status }
    }, 340)
  },

  /** Approve an application: creates the vehicle and the driver, then links both. */
  approve(regId, { reviewer = 'Ahmad Karimi' } = {}) {
    return request(() => {
      const reg = db.registrations.find((r) => r.id === regId)
      if (!reg) throw new Error('Registration not found')
      if (reg.status !== 'pending') throw new Error('Request has already been handled')
      const now = Date.now()

      const vehicle = {
        id: uniqueId('VEH-', db.vehicles, 1000 + db.vehicles.length),
        plate: reg.vehicle.plate,
        brand: reg.vehicle.brand,
        type: reg.vehicle.type,
        year: reg.vehicle.year,
        color: reg.vehicle.color,
        colorHex: reg.vehicle.colorHex,
        seats: reg.vehicle.seats,
        active: true,
        documents: [
          { name: 'Registration', status: 'verified' },
          { name: 'Insurance', status: 'verified' },
          { name: 'Inspection', status: 'verified' },
        ],
        lastService: 0,
        nextService: 180,
      }

      const area = getArea(reg.areaId) || getCity(reg.cityId)?.areas?.[0]
      const driver = {
        id: uniqueId('DRV-', db.drivers, 3100 + db.drivers.length),
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        cityId: reg.cityId,
        city: reg.city,
        areaId: reg.areaId,
        area: reg.area,
        location: area ? { x: area.x, y: area.y } : { x: 500, y: 500 },
        vehicle,
        vehicleType: vehicle.type,
        plate: vehicle.plate,
        vehicleStatus: 'idle',
        status: 'available',
        verification: 'verified',
        rating: 0,
        rides: 0,
        cancelled: 0,
        earnings: 0,
        completedRides: 0,
        joined: now,
        lastActive: now,
        onlineHours: 0,
        acceptanceRate: 100,
        currentTripId: null,
        currentTrip: false,
      }

      db.vehicles.push(vehicle)
      db.byVehicle[vehicle.id] = vehicle
      db.drivers.unshift(driver)
      db.byDriver[driver.id] = driver

      reg.status = 'approved'
      reg.reviewedAt = now
      reg.reviewer = reviewer
      reg.driverId = driver.id
      syncNotification(reg)
      writeAudit('driver.approved', driver.id)

      return { driver, registration: reg }
    }, 560)
  },

  decline(regId, { reason = 'Documents failed verification.', reviewer = 'Ahmad Karimi' } = {}) {
    return request(() => {
      const reg = db.registrations.find((r) => r.id === regId)
      if (!reg) throw new Error('Registration not found')
      if (reg.status !== 'pending') throw new Error('Request has already been handled')

      reg.status = 'declined'
      reg.reviewedAt = Date.now()
      reg.reviewer = reviewer
      reg.declineReason = reason
      syncNotification(reg)
      writeAudit('driver.registration_declined', reg.id)

      return reg
    }, 480)
  },
}
