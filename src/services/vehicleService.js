import { makeService } from './api'
import { db } from '../data/db'

const base = makeService({
  data: db.vehicles,
  searchFields: ['plate', 'brand'],
  defaultSort: 'plate',
  defaultDir: 'asc',
})

export const vehicleService = {
  list: base.list,
  get: base.get,

  getByDriver(driverId) {
    const d = db.byDriver[driverId]
    return Promise.resolve(d?.vehicle || null)
  },
}