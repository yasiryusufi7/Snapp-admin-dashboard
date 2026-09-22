// Deterministic pseudo-random helpers so the synthetic dataset is stable between renders.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed) {
  const r = mulberry32(seed)
  return {
    next: r,
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    float: (min, max) => r() * (max - min) + min,
    chance: (p) => r() < p,
    pick(arr) {
      return arr[Math.floor(r() * arr.length)]
    },
    shuffle(arr) {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    weighted(items) {
      const total = items.reduce((s, x) => s + x[1], 0)
      let roll = r() * total
      for (const [item, w] of items) {
        roll -= w
        if (roll <= 0) return item
      }
      return items[items.length - 1][0]
    },
  }
}

let seq = 10_000
export function nextSeqId(prefix) {
  seq += 1
  return `${prefix}${seq}`
}

export function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}