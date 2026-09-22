import { makeService, request } from './api'
import { db } from '../data/db'

const base = makeService({
  data: db.campaigns,
  searchFields: ['name', 'couponCode'],
  defaultSort: 'startDate',
  defaultDir: 'desc',
})

export const campaignService = {
  list: base.list,

  summary() {
    return request(() => {
      const active = db.campaigns.filter((c) => c.status === 'active')
      return {
        active: active.length,
        scheduled: db.campaigns.filter((c) => c.status === 'scheduled').length,
        redemptions: db.campaigns.reduce((s, c) => s + c.redemptions, 0),
        cost: db.campaigns.reduce((s, c) => s + c.cost, 0),
        revenue: db.campaigns.reduce((s, c) => s + c.revenue, 0),
      }
    }, 300)
  },
}