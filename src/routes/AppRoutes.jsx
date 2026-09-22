import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import DashboardPage from '../modules/dashboard/DashboardPage'

const LiveOperationsPage = lazy(() => import('../modules/live-operations/LiveOperationsPage'))
const PassengersPage = lazy(() => import('../modules/passengers/PassengersPage'))
const PassengerProfilePage = lazy(() => import('../modules/passengers/PassengerProfilePage'))
const DriversPage = lazy(() => import('../modules/drivers/DriversPage'))
const DriverProfilePage = lazy(() => import('../modules/drivers/DriverProfilePage'))
const VehiclesPage = lazy(() => import('../modules/vehicles/VehiclesPage'))
const TripsPage = lazy(() => import('../modules/trips/TripsPage'))
const TripDetailPage = lazy(() => import('../modules/trips/TripDetailPage'))
const BookingsPage = lazy(() => import('../modules/bookings/BookingsPage'))
const PaymentsPage = lazy(() => import('../modules/payments/PaymentsPage'))
const WalletPage = lazy(() => import('../modules/wallet/WalletPage'))
const FareRulesPage = lazy(() => import('../modules/fare-rules/FareRulesPage'))
const CommissionRulesPage = lazy(() => import('../modules/commission/CommissionRulesPage'))
const CitiesPage = lazy(() => import('../modules/cities/CitiesPage'))
const CampaignsPage = lazy(() => import('../modules/campaigns/CampaignsPage'))
const NotificationsPage = lazy(() => import('../modules/notifications/NotificationsPage'))
const ComplaintsPage = lazy(() => import('../modules/complaints/ComplaintsPage'))
const ReportsPage = lazy(() => import('../modules/reports/ReportsPage'))
const ExportCenterPage = lazy(() => import('../modules/exports/ExportCenterPage'))
const RolesPage = lazy(() => import('../modules/roles/RolesPage'))
const AuditLogsPage = lazy(() => import('../modules/audit/AuditLogsPage'))
const SettingsPage = lazy(() => import('../modules/settings/SettingsPage'))

const TITLES = [
  ['live-operations', 'Live Operations'],
  ['passengers', 'Passengers'],
  ['drivers', 'Drivers'],
  ['vehicles', 'Vehicles'],
  ['trips', 'Trips'],
  ['bookings', 'Bookings'],
  ['payments', 'Payments'],
  ['wallet', 'Wallet & Settlements'],
  ['fare-rules', 'Fare Rules'],
  ['commissions', 'Commission Rules'],
  ['cities', 'Cities & Areas'],
  ['campaigns', 'Campaigns'],
  ['notifications', 'Notifications'],
  ['complaints', 'Complaints'],
  ['reports', 'Reports'],
  ['exports', 'Export Center'],
  ['roles', 'Roles & Permissions'],
  ['audit', 'Audit Logs'],
  ['settings', 'Settings'],
]

function RouteTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const segment = pathname.split('/').filter(Boolean)[0] || 'dashboard'
    const match = TITLES.find(([key]) => segment.startsWith(key))
    document.title = `${match ? match[1] : 'Dashboard'} · Snapp`
  }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <p className="text-sm text-ink-faint">Loading module…</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<><RouteTitle /><AdminLayout /></>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/live-operations" element={<SuspenseBoundary><LiveOperationsPage /></SuspenseBoundary>} />
        <Route path="/passengers" element={<SuspenseBoundary><PassengersPage /></SuspenseBoundary>} />
        <Route path="/passengers/:id" element={<SuspenseBoundary><PassengerProfilePage /></SuspenseBoundary>} />
        <Route path="/drivers" element={<SuspenseBoundary><DriversPage /></SuspenseBoundary>} />
        <Route path="/drivers/:id" element={<SuspenseBoundary><DriverProfilePage /></SuspenseBoundary>} />
        <Route path="/vehicles" element={<SuspenseBoundary><VehiclesPage /></SuspenseBoundary>} />
        <Route path="/trips" element={<SuspenseBoundary><TripsPage /></SuspenseBoundary>} />
        <Route path="/trips/:id" element={<SuspenseBoundary><TripDetailPage /></SuspenseBoundary>} />
        <Route path="/bookings" element={<SuspenseBoundary><BookingsPage /></SuspenseBoundary>} />
        <Route path="/payments" element={<SuspenseBoundary><PaymentsPage /></SuspenseBoundary>} />
        <Route path="/wallet" element={<SuspenseBoundary><WalletPage /></SuspenseBoundary>} />
        <Route path="/fare-rules" element={<SuspenseBoundary><FareRulesPage /></SuspenseBoundary>} />
        <Route path="/commissions" element={<SuspenseBoundary><CommissionRulesPage /></SuspenseBoundary>} />
        <Route path="/cities" element={<SuspenseBoundary><CitiesPage /></SuspenseBoundary>} />
        <Route path="/campaigns" element={<SuspenseBoundary><CampaignsPage /></SuspenseBoundary>} />
        <Route path="/notifications" element={<SuspenseBoundary><NotificationsPage /></SuspenseBoundary>} />
        <Route path="/complaints" element={<SuspenseBoundary><ComplaintsPage /></SuspenseBoundary>} />
        <Route path="/complaints/:ticket" element={<SuspenseBoundary><ComplaintsPage /></SuspenseBoundary>} />
        <Route path="/reports" element={<SuspenseBoundary><ReportsPage /></SuspenseBoundary>} />
        <Route path="/exports" element={<SuspenseBoundary><ExportCenterPage /></SuspenseBoundary>} />
        <Route path="/roles" element={<SuspenseBoundary><RolesPage /></SuspenseBoundary>} />
        <Route path="/audit" element={<SuspenseBoundary><AuditLogsPage /></SuspenseBoundary>} />
        <Route path="/settings" element={<SuspenseBoundary><SettingsPage /></SuspenseBoundary>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

function SuspenseBoundary({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}