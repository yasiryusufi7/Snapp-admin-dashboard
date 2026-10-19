import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cx } from '../../utils/classNames'
import { NAV_SECTIONS } from '../../config/nav'
import { useAuth } from '../../context/AuthContext'
import { Tooltip } from '../ui/Tooltip'
import logoMark from '../../assets/logo-mark.svg'

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { can } = useAuth()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-navy-900 text-white shadow-xl shadow-navy-950/10 transition-[width] duration-200 lg:sticky lg:top-0 lg:h-screen',
          collapsed ? 'w-[68px]' : 'w-[250px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className={cx('flex h-16 shrink-0 items-center border-b border-white/8', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
          <img src={logoMark} alt="Snapp logo" className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold tracking-tight leading-none">Snapp<span className="ml-0.5 text-brand-300">.</span></p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Operations Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4 scroll-thin">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((i) => can(i.resource, 'view'))
            if (!items.length) return null
            return (
              <div key={section.label}>
                {!collapsed && (
                  <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-300/55">{section.label}</p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    const link = (
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          cx(
                            'group relative flex items-center gap-3 rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150',
                            collapsed ? 'justify-center px-0 mx-1' : 'px-2.5',
                            isActive
                              ? 'bg-brand-300 font-semibold text-navy-950 shadow-sm shadow-black/10'
                              : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={cx('h-[18px] w-[18px] shrink-0', isActive ? 'text-navy-950' : 'text-slate-500 group-hover:text-slate-300')} />
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.live && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  </span>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </NavLink>
                    )
                    return collapsed ? (
                      <Tooltip key={item.to} label={item.label} side="right">
                        {link}
                      </Tooltip>
                    ) : (
                      <li key={item.to}>{link}</li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/8 p-2.5">
          {collapsed ? (
            <button onClick={onToggleCollapse} className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white" aria-label="Expand sidebar" title="Expand sidebar">
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </button>
          ) : (
            <div className="flex items-center justify-between px-1">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-md bg-brand-300/12 px-2 py-1 text-[10.5px] font-medium text-brand-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                  v4.6.2
                </div>
                <span className="truncate text-[10.5px] text-slate-500">All systems nominal</span>
              </div>
              <button onClick={onToggleCollapse} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white" aria-label="Collapse sidebar" title="Collapse sidebar">
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile close */}
        <button onClick={onCloseMobile} className="absolute right-2 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white lg:hidden" aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </aside>
    </>
  )
}
