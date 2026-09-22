import { makeService, request } from './api'
import { db, getTrip } from '../data/db'

const base = makeService({
  data: db.trips,
  searchFields: ['id', 'passenger', 'driver', 'plate', 'pickup', 'destination'],
  defaultSort: 'requestedAt',
  defaultDir: 'desc',
})

export const tripService = {
  list: base.list,
  get: (id) => request(() => getTrip(id), 260),

  getTimeline(trip) {
    const events = [
      { label: 'Ride requested', meta: trip.requestedAt ? new Date(trip.requestedAt).toLocaleTimeString() : '', state: 'done' },
    ]
    if (trip.startedAt) events.push({ label: 'Driver picked up rider', state: 'done' })
    if (trip.status === 'completed')
      events.push({ label: 'Trip completed', meta: trip.completedAt ? new Date(trip.completedAt).toLocaleTimeString() : '', state: 'done' })
    if (trip.status === 'in_progress') events.push({ label: 'En route to destination', state: 'current' })
    if (trip.status === 'cancelled')
      events.push({ label: 'Trip cancelled', meta: trip.cancelReason, state: 'cancelled' })
    return events
  },
}