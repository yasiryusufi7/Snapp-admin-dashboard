/** Simulation of an HTTP/REST layer over the in-memory database.
 *  Swap these internals for real fetch() calls without touching the UI. */

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function request(producer, ms = 260) {
  await delay(ms + Math.random() * 240)
  return producer()
}

export function paginate(list, { page = 1, pageSize = 10 }) {
  const size = Math.max(5, Math.min(100, Number(pageSize) || 10))
  const total = list.length
  const pages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, Number(page) || 1), pages)
  const start = (current - 1) * size
  return {
    items: list.slice(start, start + size),
    total,
    page: current,
    pageSize: size,
    pages,
  }
}

const collator = new Intl.Collator('en', { sensitivity: 'base' })

export function matchSearch(item, query, fields) {
  if (!query) return true
  const q = query.toLowerCase().trim()
  return fields.some((f) => String(item[f] ?? '').toLowerCase().includes(q))
}

export function applySort(list, sort, dir) {
  if (!sort) return list
  const direction = dir === 'desc' ? -1 : 1
  return [...list].sort((a, b) => collator.compare(String(a[sort] ?? ''), String(b[sort] ?? '')) * direction)
}

/** Builds a queryable service around an array. */
export function makeService({ data, searchFields = [], defaultSort = null, defaultDir = 'asc' }) {
  async function list(params = {}) {
    return request(() => {
      const q = params.filters || {}
      let out = data

      for (const [key, criteria] of Object.entries(q)) {
        if (criteria == null || criteria === '' || (Array.isArray(criteria) && !criteria.length)) continue
        if (typeof criteria === 'function') {
          out = out.filter(criteria)
        } else if (Array.isArray(criteria)) {
          out = out.filter((item) => criteria.includes(item[key]))
        } else if (key === '$range') {
          out = out.filter((item) => {
            const v = item[criteria.field]
            return v >= criteria.from && v <= criteria.to
          })
        } else {
          out = out.filter((item) => String(item[key]) === String(criteria))
        }
      }

      if (!params.raw) {
        if (params.search) out = out.filter((item) => matchSearch(item, params.search, searchFields))
        out = applySort(out, params.sort || defaultSort, params.dir || defaultDir)
        return paginate(out, params)
      }
      return out
    })
  }

  async function get(id, key = 'id') {
    return request(() => data.find((item) => item[key] === id) || null)
  }

  async function allRaw(params = {}) {
    return list({ ...params, raw: true })
  }

  return { list, get, allRaw }
}