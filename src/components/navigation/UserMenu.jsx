import { useRef, useState } from 'react'
import { CheckCircle2, Info, LogOut, Moon, Settings, ShieldAlert, Sun, TriangleAlert, UserRound, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/classNames'
import { useAuth } from '../../context/AuthContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useTheme } from '../../hooks/useTheme'
import { ROLES } from '../../data/roles'
import { Avatar } from '../ui/Avatar'
import { timeAgo } from '../../utils/format'

const ALERT_TONES = {
  critical: { icon: TriangleAlert, cls: 'text-red-500', dot: 'bg-red-500' },
  high: { icon: ShieldAlert, cls: 'text-amber-500', dot: 'bg-amber-500' },
  warning: { icon: Info, cls: 'text-blue-500', dot: 'bg-blue-500' },
  info: { icon: CheckCircle2, cls: 'text-brand-500', dot: 'bg-brand-500' },
}

export function UserMenu() {
  const { user, role, switchRole } = useAuth()
  const { mode, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition hover:bg-surface3"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="md" status="online" />
        <span className="hidden text-left xl:block">
          <span className="block text-[13px] font-semibold leading-tight text-ink">{user.name}</span>
          <span className="block text-[11px] leading-tight text-ink-faint">{role.label}</span>
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-line bg-surface py-1.5 shadow-panel animate-scale-in">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink-soft">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-surface2 px-3 py-2">
              <span className="text-[11px] font-medium text-ink-faint">Last login</span>
              <span className="text-[11px] font-semibold text-ink-soft">{timeAgo(user.lastLogin)}</span>
            </div>
          </div>

          <div className="px-2 py-1.5">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Demo role</p>
            {ROLES.slice(0, 4).map((r) => (
              <button
                key={r.id}
                role="menuitem"
                onClick={() => switchRole(r.id)}
                className={cx(
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[13px] font-medium transition',
                  r.id === user.roleId ? 'bg-brand-500/10 text-brand-700 dark:text-brand-200' : 'text-ink-soft hover:bg-surface2',
                )}
              >
                {r.label}
                {r.id === user.roleId && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
              </button>
            ))}
          </div>

          <div className="border-t border-line px-2 py-1.5">
            <NavLink to="/settings" onClick={() => setOpen(false)} className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface2 hover:text-ink">
              <UserRound className="h-4 w-4" /> My profile
            </NavLink>
            <button onClick={toggle} className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface2 hover:text-ink">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Toggle theme
              <span className="ml-auto text-xs text-ink-faint capitalize">{mode}</span>
            </button>
            <NavLink to="/settings" onClick={() => setOpen(false)} className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface2 hover:text-ink">
              <Settings className="h-4 w-4" /> Settings
            </NavLink>
          </div>

          <div className="border-t border-line px-2 py-1.5">
            <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-500/8">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}