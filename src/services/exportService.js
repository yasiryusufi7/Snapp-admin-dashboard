import { request } from './api'
import { db } from '../data/db'

export const exportService = {
  list() {
    return request(() => db.exports, 320)
  },

  requestExport({ name, kind, format }) {
    return request(() => {
      const row = {
        id: `EXP-${2000 + db.exports.length}`,
        name,
        kind,
        format,
requestedBy: 'Ahmad Karimi',
        date: Date.now(),
        rows: 0,
        size: '—',
        status: 'processing',
      }
      db.exports.unshift(row)
      return row
    }, 700)
  },
}