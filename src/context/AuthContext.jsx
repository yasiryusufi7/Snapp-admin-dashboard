import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CURRENT_ADMIN, hasPermission, ROLE_BY_ID } from '../data/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(CURRENT_ADMIN)
  const role = ROLE_BY_ID[user.roleId]

  const hasPerm = useCallback((resource, action = 'view') => hasPermission(user.roleId, resource, action), [user.roleId])

  const can = useMemo(() => (resource, action = 'view') => hasPermission(user.roleId, resource, action), [user.roleId])

  const switchRole = useCallback((roleId) => {
    setUser((u) => ({ ...u, roleId, roleLabel: ROLE_BY_ID[roleId]?.label }))
  }, [])

  const value = useMemo(
    () => ({ user, role, hasPerm, can, switchRole }),
    [user, role, hasPerm, can, switchRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function usePermission(resource, action = 'view') {
  const { hasPerm } = useAuth()
  return hasPerm(resource, action)
}

/// Renders children only when the current role has the permission.
export function Can({ resource, action = 'view', children, fallback = null }) {
  const { hasPerm } = useAuth()
  return hasPerm(resource, action) ? children : fallback
}

/// Renders a full-page permission notice.
export function PermissionGate({ resource, action = 'view' }) {
  const { hasPerm } = useAuth()
  if (hasPerm(resource, action)) return null
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
        <svg className="h-6 w-6 text-brand-600 dark:text-brand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p className="font-semibold text-ink">Restricted area</p>
      <p className="max-w-sm text-sm text-ink-soft">
        Your role does not include <span className="font-medium capitalize">{action}</span> access to this module. Ask a
        Super Admin to update your role permissions.
      </p>
    </div>
  )
}