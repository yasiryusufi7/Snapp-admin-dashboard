import { makeService, request } from './api'
import { db } from '../data/db'

const base = makeService({
  data: db.notifications,
  searchFields: ['title', 'audience'],
  defaultSort: 'createdAt',
  defaultDir: 'desc',
})

export const notificationService = {
  list: base.list,

  outreachTotals() {
    return request(() => ({
      sent: db.notifications.reduce((s, n) => s + n.sent, 0),
      delivered: db.notifications.reduce((s, n) => s + n.delivered, 0),
      read: db.notifications.reduce((s, n) => s + n.read, 0),
      latest: db.notifications[0]?.id,
    }), 280)
  },

  create(payload) {
    return request(() => {
      const row = {
        id: `NTC-${990 + db.notifications.length}`,
        ...payload,
        sent: 0,
        delivered: 0,
        read: 0,
        status: payload.scheduleFor ? 'scheduled' : 'draft',
        createdAt: Date.now(),
        creator: 'Ahmad Karimi',
      }
      db.notifications.unshift(row)
      return row
    }, 500)
  },
}