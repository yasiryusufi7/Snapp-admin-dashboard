import { request } from './api'
import { CITIES } from '../data/cities'

export const cityService = {
  list() {
    return request(() =>
      CITIES.map((c) => ({
        ...c,
        areasCount: c.areas.length,
      })),
      300,
    )
  },
}