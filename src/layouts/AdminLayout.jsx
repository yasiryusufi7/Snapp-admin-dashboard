import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { Topbar } from '../components/navigation/Topbar'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useLocalStorage('snapp.sidebar', false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col pl-[68px] lg:pl-0">
        <Topbar
          onOpenMobileNav={() => setMobileOpen(true)}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="flex items-center justify-between border-t border-line px-6 py-3">
          <p className="text-[11.5px] text-ink-faint">
            © {new Date().getFullYear()} Snapp · Ride-hailing operations platform
          </p>
          <p className="text-[11.5px] text-ink-faint text-tabular">
            Dispatch · <span className="font-medium text-brand-600 dark:text-brand-300">4.2ms</span> · Last sync 12s ago
          </p>
        </footer>
      </div>
    </div>
  )
}