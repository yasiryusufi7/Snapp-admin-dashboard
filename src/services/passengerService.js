import { makeService, request } from './api'
import { db, tripsForPassenger } from '../data/db'
import { timeAgo } from '../utils/format'

const base = makeService({
  data: db.passengers,
  searchFields: ['name', 'phone', 'email', 'id'],
  defaultSort: 'joined',
  defaultDir: 'desc',
})

export const passengerService = {
  list: base.list,
  get: (id) => base.get(id),

  getTrips(passengerId) {
    return request(() => tripsForPassenger(passengerId), 320)
  },

  getPayments(passengerId) {
    return request(() => db.payments.filter((p) => p.userId === passengerId), 320)
  },

  getComplaints(passengerId) {
    return request(() => db.complaints.filter((c) => c.passengerId === passengerId), 320)
  },

  getActivity(passengerId) {
    return request(() => {
      const pax = db.byPassenger[passengerId]
      if (!pax) return []
      return [
        { type: 'signup', label: 'Account created', meta: 'via iOS app', ts: pax.joined },
        ...tripsForPassenger(passengerId)
          .slice(0, 8)
          .map((t) => ({
            type: t.status === 'cancelled' ? 'cancel' : 'trip',
            label: t.status === 'cancelled' ? 'Trip cancelled' : 'Trip completed',
            meta: `${t.pickup} → ${t.destination} · ${t.fare} AFN`,
            ts: t.requestedAt,
          })),
      ].sort((a, b) => b.ts - a.ts)
    }, 300)
  },

  setStatus(id, status) {
    return request(() => {
      const pax = db.byPassenger[id]
      if (!pax) throw new Error('Passenger not found')
      pax.status = status
      return { id: pax.id, status }
    }, 400)
  },

  /** Avatar initials / color are derived in the UI, no asset needed. */
  formatLastSeen(pax) {
    return pax.lastActive ? timeAgo(pax.lastActive) : '—'
  },
}