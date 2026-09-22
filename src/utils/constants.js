// Semantic status definitions shared across the platform.
// Each entry: { label, tone }

export const TONES = {
  brand: {
    badge: 'bg-[rgb(200,241,53)/0.12] text-[rgb(95,125,0)] dark:bg-[rgb(200,241,53)/0.10] dark:text-[rgb(200,241,53)]',
    dot: 'bg-[rgb(200,241,53)]',
    text: 'text-[rgb(95,125,0)] dark:text-[rgb(200,241,53)]',
    solid: 'bg-[rgb(127,170,0)] text-white',
    fill: '#c8f135',
  },
  green: {
    badge: 'bg-[rgb(22,163,74)/0.12] text-[rgb(22,163,74)] dark:bg-[rgb(22,163,74)/0.10] dark:text-[rgb(74,222,128)]',
    dot: 'bg-[rgb(22,163,74)]',
    text: 'text-[rgb(22,163,74)] dark:text-[rgb(74,222,128)]',
    solid: 'bg-[rgb(22,163,74)] text-white',
    fill: '#16a34a',
  },
  amber: {
    badge: 'bg-[rgb(245,158,11)/0.12] text-[rgb(245,158,11)] dark:bg-[rgb(245,158,11)/0.10] dark:text-[rgb(251,191,36)]',
    dot: 'bg-[rgb(245,158,11)]',
    text: 'text-[rgb(245,158,11)] dark:text-[rgb(251,191,36)]',
    solid: 'bg-[rgb(245,158,11)] text-ink',
    fill: '#f59e0b',
  },
  red: {
    badge: 'bg-[rgb(239,68,68)/0.12] text-[rgb(239,68,68)] dark:bg-[rgb(239,68,68)/0.10] dark:text-[rgb(248,113,113)]',
    dot: 'bg-[rgb(239,68,68)]',
    text: 'text-[rgb(239,68,68)] dark:text-[rgb(248,113,113)]',
    solid: 'bg-[rgb(239,68,68)] text-white',
    fill: '#ef4444',
  },
  blue: {
    badge: 'bg-[rgb(59,130,246)/0.12] text-[rgb(59,130,246)] dark:bg-[rgb(59,130,246)/0.10] dark:text-[rgb(96,165,250)]',
    dot: 'bg-[rgb(59,130,246)]',
    text: 'text-[rgb(59,130,246)] dark:text-[rgb(96,165,250)]',
    solid: 'bg-[rgb(59,130,246)] text-white',
    fill: '#3b82f6',
  },
  violet: {
    badge: 'bg-[rgb(139,92,246)/0.12] text-[rgb(139,92,246)] dark:bg-[rgb(139,92,246)/0.10] dark:text-[rgb(167,139,250)]',
    dot: 'bg-[rgb(139,92,246)]',
    text: 'text-[rgb(139,92,246)] dark:text-[rgb(167,139,250)]',
    solid: 'bg-[rgb(139,92,246)] text-white',
    fill: '#8b5cf6',
  },
  teal: {
    badge: 'bg-[rgb(20,184,166)/0.12] text-[rgb(20,184,166)] dark:bg-[rgb(20,184,166)/0.10] dark:text-[rgb(94,234,212)]',
    dot: 'bg-[rgb(20,184,166)]',
    text: 'text-[rgb(20,184,166)] dark:text-[rgb(94,234,212)]',
    solid: 'bg-[rgb(20,184,166)] text-white',
    fill: '#14b8a6',
  },
  slate: {
    badge: 'bg-[rgb(100,116,139)/0.12] text-[rgb(100,116,139)] dark:bg-[rgb(148,163,184)/0.10] dark:text-[rgb(203,213,225)]',
    dot: 'bg-[rgb(148,163,184)]',
    text: 'text-[rgb(100,116,139)] dark:text-[rgb(203,213,225)]',
    solid: 'bg-[rgb(100,116,139)] text-white',
    fill: '#94a3b8',
  },
}

export const STATUS = {
  trip: {
    requested: { label: 'Requested', tone: 'slate' },
    accepted: { label: 'Accepted', tone: 'blue' },
    arriving: { label: 'Driver Arriving', tone: 'blue' },
    arrived: { label: 'Driver Arrived', tone: 'violet' },
    in_progress: { label: 'In Progress', tone: 'brand' },
    completed: { label: 'Completed', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
    failed: { label: 'Failed', tone: 'red' },
  },
  driver: {
    available: { label: 'Available', tone: 'green' },
    busy: { label: 'On Trip', tone: 'blue' },
    break: { label: 'On Break', tone: 'amber' },
    offline: { label: 'Offline', tone: 'slate' },
    suspended: { label: 'Suspended', tone: 'red' },
  },
  verification: {
    verified: { label: 'Verified', tone: 'green' },
    pending: { label: 'Pending', tone: 'amber' },
    rejected: { label: 'Rejected', tone: 'red' },
    expired: { label: 'Expired', tone: 'amber' },
    review: { label: 'In Review', tone: 'blue' },
  },
  payment: {
    completed: { label: 'Completed', tone: 'green' },
    pending: { label: 'Pending', tone: 'amber' },
    failed: { label: 'Failed', tone: 'red' },
    refunded: { label: 'Refunded', tone: 'violet' },
    cancelled: { label: 'Cancelled', tone: 'slate' },
    prepaid: { label: 'Prepaid', tone: 'blue' },
  },
  booking: {
    scheduled: { label: 'Scheduled', tone: 'blue' },
    assigned: { label: 'Assigned', tone: 'brand' },
    pending: { label: 'Awaiting Driver', tone: 'amber' },
    completed: { label: 'Completed', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
  },
  complaint: {
    new: { label: 'New', tone: 'red' },
    in_review: { label: 'In Review', tone: 'amber' },
    assigned: { label: 'Assigned', tone: 'blue' },
    waiting: { label: 'Waiting on User', tone: 'violet' },
    resolved: { label: 'Resolved', tone: 'green' },
    closed: { label: 'Closed', tone: 'slate' },
  },
  notification: {
    draft: { label: 'Draft', tone: 'slate' },
    scheduled: { label: 'Scheduled', tone: 'blue' },
    sending: { label: 'Sending', tone: 'amber' },
    sent: { label: 'Sent', tone: 'green' },
    cancelled: { label: 'Cancelled', tone: 'red' },
  },
  campaign: {
    draft: { label: 'Draft', tone: 'slate' },
    scheduled: { label: 'Scheduled', tone: 'blue' },
    active: { label: 'Active', tone: 'green' },
    paused: { label: 'Paused', tone: 'amber' },
    ended: { label: 'Ended', tone: 'slate' },
  },
  city: {
    active: { label: 'Active', tone: 'green' },
    ramping: { label: 'Launching', tone: 'blue' },
    paused: { label: 'Paused', tone: 'amber' },
  },
  vehicle: {
    active: { label: 'Active', tone: 'green' },
    idle: { label: 'Idle', tone: 'slate' },
    maintenance: { label: 'Maintenance', tone: 'amber' },
    suspended: { label: 'Suspended', tone: 'red' },
  },
  export: {
    queued: { label: 'Queued', tone: 'slate' },
    processing: { label: 'Processing', tone: 'amber' },
    completed: { label: 'Completed', tone: 'green' },
    failed: { label: 'Failed', tone: 'red' },
  },
  settlement: {
    pending: { label: 'Pending', tone: 'amber' },
    processing: { label: 'Processing', tone: 'blue' },
    settled: { label: 'Settled', tone: 'green' },
    failed: { label: 'Failed', tone: 'red' },
  },
  demand: {
    low: { label: 'Low', tone: 'slate' },
    normal: { label: 'Normal', tone: 'blue' },
    high: { label: 'High', tone: 'amber' },
    surge: { label: 'Surge', tone: 'red' },
  },
}

export const COMPLAINT_CATEGORIES = [
  { key: 'driver_behavior', label: 'Driver Behavior' },
  { key: 'passenger_behavior', label: 'Passenger Behavior' },
  { key: 'fare_dispute', label: 'Fare Dispute' },
  { key: 'lost_item', label: 'Lost Item' },
  { key: 'payment_issue', label: 'Payment Issue' },
  { key: 'trip_issue', label: 'Trip Issue' },
  { key: 'technical', label: 'Technical Issue' },
  { key: 'other', label: 'Other' },
]

export const PAYMENT_METHODS = ['card', 'wallet', 'cash']
export const VEHICLE_TYPES = ['economy', 'executive', 'xl', 'eco']

export const VEHICLE_TYPE_LABELS = {
  economy: 'Economy',
  executive: 'Executive',
  xl: 'XL Minivan',
  eco: 'Electric',
}

export const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '3 Months' },
  { key: '12m', label: '12 Months' },
  { key: 'custom', label: 'Custom' },
]

export const PAYMENT_METHOD_LABELS = {
  card: 'Card',
  wallet: 'Wallet',
  cash: 'Cash',
}