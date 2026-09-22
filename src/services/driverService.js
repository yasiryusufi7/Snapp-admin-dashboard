import { request } from './api'
import { makeService } from './api'
import { db, tripsForDriver } from '../data/db'

const base = makeService({
  data: db.drivers,
  searchFields: ['name', 'phone', 'email', 'id', 'plate'],
  defaultSort: 'joined',
  defaultDir: 'desc',
})

export const driverService = {
  list: base.list,
  get: base.get,

  getTrips(driverId) {
    return request(() => tripsForDriver(driverId), 320)
  },

  getEarnings(driverId) {
    return request(() => {
      const s = db.settlements.find((x) => x.driverId === driverId)
      return s || null
    }, 300)
  },

  updateVerification(driverId, step, status) {
    return request(() => {
      const d = db.byDriver[driverId]
      if (!d) throw new Error('Driver not found')
      d.verification = status
      return { id: d.id, step, status }
    }, 420)
  },

  updateDocument(driverId, docName, status) {
    return request(() => {
      const d = db.byDriver[driverId]
      const v = d?.vehicle
      const doc = v?.documents?.find((x) => x.name === docName)
      if (doc) doc.status = status
      return { id: driverId, doc: docName, status }
    }, 420)
  },

  setStatus(driverId, status) {
    return request(() => {
      const d = db.byDriver[driverId]
      d.status = status
      return { id: d.id, status }
    }, 380)
  },
}