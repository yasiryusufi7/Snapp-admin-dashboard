import { request } from './api'

const DEFAULTS = {
  general: {
    companyName: 'Snapp',
    supportEmail: 'support@snapp.com',
    supportPhone: '+93 20 210 00 01',
    currency: 'AFN',
    timezone: 'UTC+4:30 (Kabul)',
    language: 'en-AF',
  },
  operations: {
    autoAssign: true,
    maxDispatchRadiusKm: 8,
    noShowGraceMin: 7,
    cancelFreeWindowMin: 5,
    allowCash: true,
    requireRatingOnCash: true,
  },
  pricing: {
    roundFareToNearest: 5,
    surgeEnabled: true,
    surgeCap: 2.2,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    driverSmsQuota: 12000,
  },
  security: {
    minPasswordLength: 10,
    sessionHours: 8,
    twoFactor: true,
    ipRestriction: false,
    passwordExpiryDays: 90,
  },
  system: {
    maintenanceMode: false,
    legacyApi: false,
    debugLogs: false,
  },
}

export const settingsService = {
  get() {
    return request(() => structuredClone(DEFAULTS), 320)
  },
  save(section, patch) {
    return request(() => {
      Object.assign(DEFAULTS[section] || {}, patch)
      return { section, saved: true }
    }, 420)
  },
}