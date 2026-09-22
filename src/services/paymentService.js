import { makeService, request } from './api'
import { db } from '../data/db'

const base = makeService({
  data: db.payments,
  searchFields: ['id', 'ref', 'userName', 'tripId'],
  defaultSort: 'createdAt',
  defaultDir: 'desc',
})

export const paymentService = {
  list: base.list,
  get: base.get,

  kpis() {
    return request(() => {
      const completed = db.payments.filter((p) => p.status === 'completed')
      const todayStart = new Date().setHours(0, 0, 0, 0)
      const today = completed.filter((p) => p.createdAt >= todayStart)
      return {
        volume: completed.reduce((s, p) => s + p.amount, 0),
        commission: completed.reduce((s, p) => s + p.commission, 0),
        todayVolume: today.reduce((s, p) => s + p.amount, 0),
        failed: db.payments.filter((p) => p.status === 'failed').length,
        refunded: db.payments.filter((p) => p.status === 'refunded').length,
        average: completed.length
          ? completed.reduce((s, p) => s + p.amount, 0) / completed.length
          : 0,
      }
    }, 320)
  },

  refund(id) {
    return request(() => {
      const p = db.payments.find((x) => x.id === id)
      if (p) p.status = 'refunded'
      return { id, status: 'refunded' }
    }, 480)
  },
}