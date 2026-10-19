import {
  LayoutDashboard,
  Radio,
  UsersRound,
  CarFront,
  Car,
  Route,
  CalendarCheck2,
  CreditCard,
  Wallet,
  Calculator,
  Percent,
  Map,
  Megaphone,
  Bell,
  LifeBuoy,
  FileText,
  Download,
  ShieldCheck,
  History,
  Settings,
} from 'lucide-react'

export const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, resource: 'dashboard', end: true },
      { to: '/live-operations', label: 'Live Operations', icon: Radio, resource: 'liveOps', live: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/passengers', label: 'Passengers', icon: UsersRound, resource: 'passengers' },
      { to: '/drivers', label: 'Drivers', icon: CarFront, resource: 'drivers' },
      { to: '/vehicles', label: 'Vehicles', icon: Car, resource: 'vehicles' },
      { to: '/trips', label: 'Trips', icon: Route, resource: 'trips' },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck2, resource: 'bookings' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/payments', label: 'Payments', icon: CreditCard, resource: 'payments' },
      { to: '/wallet', label: 'Wallet & Settlement', icon: Wallet, resource: 'wallet' },
      { to: '/fare-rules', label: 'Fare Rules', icon: Calculator, resource: 'fareRules' },
      { to: '/commissions', label: 'Commission Rules', icon: Percent, resource: 'commissions' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/cities', label: 'Cities & Areas', icon: Map, resource: 'cities' },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone, resource: 'campaigns' },
      { to: '/notifications', label: 'Notifications', icon: Bell, resource: 'notifications' },
      { to: '/complaints', label: 'Complaints', icon: LifeBuoy, resource: 'complaints' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/reports', label: 'Reports', icon: FileText, resource: 'reports' },
      { to: '/exports', label: 'Export Center', icon: Download, resource: 'exports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, resource: 'roles' },
      { to: '/audit', label: 'Audit Logs', icon: History, resource: 'auditLogs' },
      { to: '/settings', label: 'Settings', icon: Settings, resource: 'settings' },
    ],
  },
]

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export function titleForPath(pathname) {
  if (pathname === '/') return 'Dashboard'
  const item = ALL_NAV_ITEMS.find((i) => i.to !== '/' && pathname.startsWith(i.to))
  if (!item) return null
  if (pathname.startsWith('/passengers/')) return 'Passenger Profile'
  if (pathname.startsWith('/drivers/')) return 'Driver Profile'
  if (pathname.startsWith('/trips/')) return 'Trip Detail'
  if (pathname.startsWith('/complaints/')) return 'Complaint Detail'
  return item.label
}
