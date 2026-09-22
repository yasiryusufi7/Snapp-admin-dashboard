// Cities and operational areas.
// Coordinates live in a normalized 0..1000 space used by the mock map renderer.

export const CITIES = [
  {
    id: 'kbl',
    name: 'Kabul',
    demand: 'surge',
    status: 'active',
    activeDrivers: 1820,
    activeTrips: 626,
    color: '#1aa28f',
    areas: [
      { id: 'kbl-sha', name: 'Shar-e-Naw', x: 480, y: 420, r: 78, demand: 'surge', zone: 'Central' },
      { id: 'kbl-wak', name: 'Wazir Akbar Khan', x: 560, y: 330, r: 62, demand: 'surge', zone: 'Central' },
      { id: 'kbl-kpr', name: 'Karte Parwan', x: 430, y: 540, r: 82, demand: 'high', zone: 'South' },
      { id: 'kbl-tai', name: 'Taimani', x: 600, y: 480, r: 66, demand: 'high', zone: 'Central' },
      { id: 'kbl-khk', name: 'Khair Khana', x: 560, y: 180, r: 90, demand: 'high', zone: 'North' },
      { id: 'kbl-dab', name: 'Dashte Barchi', x: 240, y: 430, r: 95, demand: 'high', zone: 'West' },
      { id: 'kbl-old', name: 'Old City', x: 460, y: 640, r: 72, demand: 'normal', zone: 'Old City' },
      { id: 'kbl-mac', name: 'Macroyan', x: 680, y: 420, r: 68, demand: 'normal', zone: 'East' },
      { id: 'kbl-dem', name: 'Dehmazang', x: 360, y: 460, r: 60, demand: 'normal', zone: 'West' },
    ],
  },
  {
    id: 'mzr',
    name: 'Mazar-e-Sharif',
    demand: 'normal',
    status: 'active',
    activeDrivers: 480,
    activeTrips: 118,
    color: '#3b82f6',
    areas: [
      { id: 'mzr-ray', name: 'Raye Howz', x: 500, y: 480, r: 80, demand: 'surge', zone: 'Central' },
      { id: 'mzr-shb', name: 'Shor Bazaar', x: 350, y: 420, r: 72, demand: 'high', zone: 'West' },
      { id: 'mzr-nwa', name: 'Now Abad', x: 400, y: 620, r: 88, demand: 'normal', zone: 'South' },
      { id: 'mzr-nab', name: 'Nawabad', x: 600, y: 340, r: 78, demand: 'normal', zone: 'North' },
      { id: 'mzr-dsh', name: 'Dasht-e-Shor', x: 640, y: 560, r: 80, demand: 'normal', zone: 'East' },
    ],
  },
  {
    id: 'her',
    name: 'Herat',
    demand: 'high',
    status: 'active',
    activeDrivers: 560,
    activeTrips: 148,
    color: '#8b5cf6',
    areas: [
      { id: 'her-sho', name: 'Shohada', x: 500, y: 440, r: 84, demand: 'surge', zone: 'Central' },
      { id: 'her-ghu', name: 'Ghuranjal', x: 680, y: 470, r: 92, demand: 'high', zone: 'East' },
      { id: 'her-sek', name: 'Sekandar Kala', x: 260, y: 300, r: 78, demand: 'normal', zone: 'North' },
      { id: 'her-csu', name: 'Char Suq', x: 430, y: 600, r: 64, demand: 'high', zone: 'Old Town' },
      { id: 'her-nwa', name: 'Nawabad', x: 430, y: 700, r: 80, demand: 'normal', zone: 'South' },
    ],
  },
  {
    id: 'kdh',
    name: 'Kandahar',
    demand: 'normal',
    status: 'active',
    activeDrivers: 210,
    activeTrips: 42,
    color: '#f59e0b',
    areas: [
      { id: 'kdh-ain', name: 'Aino Mina', x: 540, y: 400, r: 78, demand: 'surge', zone: 'Central' },
      { id: 'kdh-mir', name: 'Mirwais Mina', x: 420, y: 540, r: 76, demand: 'high', zone: 'Old City' },
      { id: 'kdh-san', name: 'Shahr-e-Naw', x: 430, y: 280, r: 70, demand: 'normal', zone: 'North' },
      { id: 'kdh-dan', name: 'Dand', x: 200, y: 460, r: 82, demand: 'low', zone: 'West' },
    ],
  },
  {
    id: 'jal',
    name: 'Jalalabad',
    demand: 'low',
    status: 'ramping',
    activeDrivers: 96,
    activeTrips: 18,
    color: '#ef4444',
    areas: [
      { id: 'jal-naw', name: 'Nawa', x: 520, y: 460, r: 80, demand: 'high', zone: 'Central' },
      { id: 'jal-bas', name: 'Bashiwal', x: 420, y: 300, r: 70, demand: 'normal', zone: 'North' },
      { id: 'jal-cha', name: 'Chaharbagh', x: 660, y: 520, r: 74, demand: 'normal', zone: 'East' },
      { id: 'jal-sar', name: 'Sar Rajan', x: 300, y: 560, r: 78, demand: 'low', zone: 'West' },
    ],
  },
]

export const getCity = (id) => CITIES.find((c) => c.id === id)
export const getArea = (areaId) => {
  for (const c of CITIES) {
    const a = c.areas.find((x) => x.id === areaId)
    if (a) return { ...a, cityId: c.id, city: c.name }
  }
  return null
}
export const allAreas = () => CITIES.flatMap((c) => c.areas.map((a) => ({ ...a, cityId: c.id, city: c.name })))