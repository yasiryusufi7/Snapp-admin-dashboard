import { makeService, request } from './api'
import { db } from '../data/db'

export const bookingService = makeService({
  data: db.bookings,
  searchFields: ['id', 'passenger', 'pickup', 'destination'],
  defaultSort: 'scheduledFor',
  defaultDir: 'asc',
})

bookingService.assign = (id) =>
  request(() => {
    const b = db.bookings.find((x) => x.id === id)
    if (b && b.status === 'scheduled') {
      b.status = 'assigned'
    }
    return b || null
  }, 300)

bookingService.cancel = (id) =>
  request(() => {
    const b = db.bookings.find((x) => x.id === id)
    if (b) {
      b.status = 'cancelled'
      b.paymentStatus = 'cancelled'
    }
    return b
  }, 300)