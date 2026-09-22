// Role definitions and the permission matrix.
// resources: dashboard | liveOps | passengers | drivers | vehicles | trips | bookings |
//            payments | wallet | fareRules | commissions | cities | campaigns | notifications |
//            complaints | reports | analytics | exports | roles | auditLogs | settings

const ALL = ['view', 'create', 'edit', 'delete', 'approve', 'export']

export const ROLES = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Full platform access, including RBAC and system configuration.',
    members: 2,
    color: 'brand',
    permissions: Object.fromEntries(
      ['dashboard', 'liveOps', 'passengers', 'drivers', 'vehicles', 'trips', 'bookings',
        'payments', 'wallet', 'fareRules', 'commissions', 'cities', 'campaigns', 'notifications',
        'complaints', 'reports', 'analytics', 'exports', 'roles', 'auditLogs', 'settings'].map((r) => [r, ALL]),
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Daily management across most modules but not platform-level RBAC.',
    members: 4,
    color: 'green',
    permissions: {
      dashboard: ALL, liveOps: ALL, passengers: ALL.slice(0, 5), drivers: ALL, vehicles: ALL,
      trips: ALL.slice(0, 5), bookings: ALL.slice(0, 5), payments: ['view', 'export', 'approve'],
      wallet: ['view', 'edit', 'approve'], fareRules: ['view', 'create', 'edit'],
      commissions: ['view', 'create', 'edit'], cities: ['view', 'create', 'edit'],
      campaigns: ALL.slice(0, 5), notifications: ALL.slice(0, 5), complaints: ALL.slice(0, 5),
      reports: ['view'], analytics: ['view'], exports: ['view', 'create', 'export'],
      roles: ['view'], auditLogs: ['view'], settings: ['view', 'edit'],
    },
  },
  {
    id: 'operations_manager',
    label: 'Operations Manager',
    description: 'Owns supply, live operations and service quality across cities.',
    members: 6,
    color: 'blue',
    permissions: {
      dashboard: ['view'], liveOps: ALL, passengers: ['view'], drivers: ALL, vehicles: ALL,
      trips: ALL.slice(0, 5), bookings: ['view', 'create', 'edit'], payments: ['view'],
      wallet: ['view'], fareRules: ['view', 'edit'], commissions: ['view'],
      cities: ['view', 'create', 'edit'], campaigns: ['view', 'create', 'edit'],
      notifications: ALL.slice(0, 4), complaints: ALL.slice(0, 5), reports: ['view'],
      analytics: ['view'], exports: ['view', 'create'], roles: [], auditLogs: ['view'], settings: [],
    },
  },
  {
    id: 'finance_manager',
    label: 'Finance Manager',
    description: 'Financial reconciliation, settlements, refunds and commission control.',
    members: 3,
    color: 'violet',
    permissions: {
      dashboard: ['view'], liveOps: [], passengers: ['view'], drivers: ['view'],
      vehicles: ['view'], trips: ['view'], bookings: [], payments: ALL,
      wallet: ALL, fareRules: ['view', 'create', 'edit'], commissions: ['view', 'create', 'edit', 'approve'],
      cities: [], campaigns: ['view'], notifications: [], complaints: ['view', 'edit'],
      reports: ['view'], analytics: ['view'], exports: ['view', 'create'], roles: [], auditLogs: ['view'], settings: [],
    },
  },
  {
    id: 'support_manager',
    label: 'Support Manager',
    description: 'Complaint resolution, refunds and rider/driver escalation workflows.',
    members: 9,
    color: 'amber',
    permissions: {
      dashboard: ['view'], liveOps: ['view'], passengers: ['view', 'edit'], drivers: ['view', 'edit'],
      vehicles: ['view'], trips: ['view'], bookings: ['view'], payments: ['view', 'approve'],
      wallet: ['view'], fareRules: [], commissions: [], cities: [], campaigns: [],
      notifications: ['view', 'create'], complaints: ALL.slice(0, 5), reports: [],
      analytics: [], exports: ['view'], roles: [], auditLogs: [], settings: [],
    },
  },
  {
    id: 'dispatcher',
    label: 'Dispatcher',
    description: 'Monitors live operations and coordinates driver assignment.',
    members: 14,
    color: 'teal',
    permissions: {
      dashboard: ['view'], liveOps: ALL, passengers: ['view'], drivers: ['view', 'edit'],
      vehicles: ['view'], trips: ['view', 'create', 'edit'], bookings: ['view', 'create', 'edit'],
      payments: [], wallet: [], fareRules: [], commissions: [], cities: ['view'],
      campaigns: [], notifications: ['view', 'create'], complaints: ['view', 'edit'],
      reports: [], analytics: [], exports: [], roles: [], auditLogs: [], settings: [],
    },
  },
  {
    id: 'analyst',
    label: 'Analyst',
    description: 'Read-only access to reports, analytics and export tooling.',
    members: 5,
    color: 'slash',
    permissions: {
      dashboard: ['view'], liveOps: ['view'], passengers: ['view'], drivers: ['view'],
      vehicles: ['view'], trips: ['view'], bookings: ['view'], payments: ['view'],
      wallet: ['view'], fareRules: [], commissions: [], cities: ['view'], campaigns: ['view'],
      notifications: [], complaints: ['view'], reports: ['view', 'export'], analytics: ['view', 'export'],
      exports: ['view', 'create'], roles: [], auditLogs: [], settings: [],
    },
  },
]

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]))

export const RESOURCES = [
  { key: 'passengers', label: 'Passengers' },
  { key: 'drivers', label: 'Drivers' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'trips', label: 'Trips' },
  { key: 'payments', label: 'Payments' },
  { key: 'reports', label: 'Reports & Analytics' },
  { key: 'settings', label: 'Settings' },
  { key: 'roles', label: 'Roles & Users' },
  { key: 'auditLogs', label: 'Audit Logs' },
]

export const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
]

export function hasPermission(roleId, resource, action) {
  const role = ROLE_BY_ID[roleId]
  if (!role) return false
  const perms = role.permissions[resource]
  return Array.isArray(perms) && perms.includes(action)
}

export const CURRENT_ADMIN = {
  id: 'ADM-001',
  name: 'Ahmad Karimi',
  email: 'ahmad.karimi@snapp.com',
  roleId: 'super_admin',
  roleLabel: 'Super Admin',
  phone: '+93 20 210 00 01',
  title: 'Platform Lead',
  lastLogin: Date.now() - 44 * 60000,
}