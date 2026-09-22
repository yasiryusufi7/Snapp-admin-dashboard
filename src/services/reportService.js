import { request } from './api'
import { db } from '../data/db'

const PREVIEWS = {
  trips: [
    {
      name: 'Completed trips',
      value: db.trips.filter((t) => t.status === 'completed').length.toLocaleString(),
      delta: 12,
      share: 94,
    },
    { name: 'Cancellations', value: db.trips.filter((t) => t.status === 'cancelled').length.toLocaleString(), delta: -3, share: 9 },
    {
      name: 'Gross revenue',
      value: new Intl.NumberFormat('en-AF', { style: 'currency', currency: 'AFN', maximumFractionDigits: 0 }).format(
        db.trips.filter((t) => t.status === 'completed').reduce((s, t) => s + t.fare, 0),
      ),
      delta: 7,
      share: 100,
    },
    { name: 'Avg fare / trip', value: `${(db.trips.filter((t) => t.status === 'completed').reduce((s, t) => s + t.fare, 0) / Math.max(db.trips.filter((t) => t.status === 'completed').length, 1)).toFixed(0)} AFN`, delta: 2, share: 100 },
  ],
  drivers: [
    { name: 'Active partners', value: String(db.drivers.filter((d) => ['available', 'busy', 'break'].includes(d.status)).length), delta: 5, share: 62 },
    { name: 'Avg acceptance', value: `${(db.drivers.reduce((s, d) => s + d.acceptanceRate, 0) / db.drivers.length).toFixed(1)}%`, delta: 1, share: 100 },
    { name: 'Avg rating', value: `${(db.drivers.reduce((s, d) => s + d.rating, 0) / db.drivers.length).toFixed(2)}★`, delta: 0, share: 100 },
    { name: 'Med. weekly earnings', value: '24,180 AFN', delta: 4, share: 100 },
  ],
  payments: [
    { name: 'Processed volume', value: new Intl.NumberFormat('en-AF', { style: 'currency', currency: 'AFN', notation: 'compact', maximumFractionDigits: 1 }).format(db.payments.reduce((s, p) => s + p.amount, 0)), delta: 9, share: 100 },
    { name: 'Take rate', value: `${((db.payments.reduce((s, p) => s + p.commission, 0) / Math.max(db.payments.reduce((s, p) => s + p.amount, 0), 1)) * 100).toFixed(1)}%`, delta: 0, share: 100 },
    { name: 'Refunds', value: '0.8%', delta: -1, share: 2 },
    { name: 'PSP fees', value: '2.9%', delta: 0, share: 100 },
  ],
  complaints: [
    { name: 'Open tickets', value: String(db.complaints.filter((c) => ['new', 'in_review', 'assigned', 'waiting'].includes(c.status)).length), delta: -6, share: 100 },
    { name: 'SLA coverage', value: '94.2%', delta: 1, share: 100 },
    { name: 'Fare disputes', value: db.complaints.filter((c) => c.category === 'fare_dispute').length.toLocaleString(), delta: 4, share: 100 },
    { name: 'Repeat offenders', value: '7 drivers', delta: -2, share: 100 },
  ],
}

export const reportService = {
  preview(kind) {
    return request(() => PREVIEWS[kind] || PREVIEWS.trips, 420)
  },
}