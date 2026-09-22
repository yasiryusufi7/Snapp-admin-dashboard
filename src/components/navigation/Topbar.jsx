import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PanelLeft, Search } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { titleForPath } from '../../config/nav'
import { NotificationBell } from './NotificationBell'
import { UserMenu } from './UserMenu'
import { GlobalSearch } from './GlobalSearch'
import { Kbd } from '../ui/Kbd'
import { useTheme } from '../../hooks/useTheme'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export function Topbar({ onOpenMobileNav, onToggleSidebar, collapsed }) {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchTrigger = useRef(null)
  const { mode, toggle } = useTheme()
  const isMobile = useMediaQuery('(max-width: 1023px)')

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const title = titleForPath(location.pathname) || 'Platform'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur">
      {/* Mobile nav */}
      <button
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface3 lg:hidden"
        aria-label="Open navigation"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {/* Desktop collapse */}
      {!isMobile && (
        <button
          onClick={onToggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition hover:bg-surface3 hover:text-ink lg:flex"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className={cx('h-4.5 w-4.5 transition-transform duration-200', collapsed && 'rotate-180')} />
        </button>
      )}

      {/* Page title */}
      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-bold tracking-tight text-ink">{title}</h2>
        <p className="hidden text-[11px] text-ink-faint sm:block">
          Snapp · Kabul · <span className="text-tabular">UTC+4:30</span>
        </p>
      </div>

      {/* Command search */}
      <button
        ref={searchTrigger}
        onClick={() => setSearchOpen(true)}
        className="focus-ring mx-auto hidden w-full max-w-md items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink-faint transition hover:border-line-strong sm:flex"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span className="truncate">Search passengers, drivers, trips, vehicles…</span>
        <span className="ml-auto inline-flex items-center gap-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button onClick={() => setSearchOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-surface3 sm:hidden" aria-label="Search">
        <Search className="h-5 w-5" />
      </button>

      {/* System status */}
      <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 md:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-ink-soft">Operational</span>
        <span className="text-[11px] text-ink-faint text-tabular">99.98%</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-faint transition hover:bg-surface3 hover:text-ink sm:flex"
      >
        {mode === 'dark' ? (
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
        ) : (
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        )}
      </button>

      <NotificationBell />
      <div className="mx-1 h-6 w-px bg-line" />
      <UserMenu />

      {searchOpen && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} triggerRef={searchTrigger} />}
    </header>
  )
}