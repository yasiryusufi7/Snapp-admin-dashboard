import { request } from './api'
import { db } from '../data/db'

export const walletService = {
  summary() {
    return request(() => {
      const totalPayable = db.settlements.reduce((s, x) => s + x.pending, 0)
      const totalSettled = db.settlements.reduce((s, x) => s + x.settled, 0)
      const pendingCount = db.settlements.filter((x) => x.pending > 0).length
      return {
        totalPayable,
        totalSettled,
        pendingCount,
        drivers: db.settlements.length,
      }
    }, 320)
  },

  list(params) {
    return request(() => {
      const q = (params?.search || '').toLowerCase()
      const rows = db.settlements
        .filter((s) => !q || s.driver.toLowerCase().includes(q) || s.driverId.toLowerCase().includes(q))
        .filter((s) => !params?.status || (params.status === 'pending' ? s.pending > 0 : s.pending === 0))
        .sort((a, b) => b.pending - a.pending)
        .slice(0, params?.limit || 60)
      return rows
    }, 300)
  },

  hold(driverId, held) {
    return request(async () => {
      const s = db.settlements.find((x) => x.driverId === driverId)
      if (s) s.held = held ? pendingHold(s) : null
      return s
    }, 260)
  },

  payNow(driverId) {
    return request(async () => {
      const s = db.settlements.find((x) => x.driverId === driverId)
      if (s && s.pending > 0) {
        s.settled += s.pending
        s.pending = 0
        s.withdrawals += 1
      }
      return s
    }, 380)
  },
}

function pendingHold(s) {
  return `HLD-${s.driverId.slice(-5)}`
}

export const settlementService = walletService