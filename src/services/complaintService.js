import { makeService, request } from './api'
import { db } from '../data/db'

const base = makeService({
  data: db.complaints,
  searchFields: ['id', 'ticket', 'passenger', 'driver', 'subject'],
  defaultSort: 'created',
  defaultDir: 'desc',
})

export const complaintService = {
  list: base.list,
  get: base.get,

  kpis() {
    return request(() => {
      const open = db.complaints.filter((c) => ['new', 'in_review', 'assigned', 'waiting'].includes(c.status))
      return {
        open: open.length,
        critical: open.filter((c) => c.priority === 'critical').length,
        avgResolutionHours: 11.4,
        byCategory: Object.entries(
          open.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] || 0) + 1
            return acc
          }, {}),
        )
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      }
    }, 300)
  },

  updateStatus(id, status) {
    return request(() => {
      const c = db.complaints.find((x) => x.id === id || x.ticket === id)
      if (c) c.status = status
      return { id, status }
    }, 420)
  },

  assign(id, agent) {
    return request(() => {
      const c = db.complaints.find((x) => x.id === id || x.ticket === id)
      if (c) c.assignedTo = agent
      return c
    }, 300)
  },
}