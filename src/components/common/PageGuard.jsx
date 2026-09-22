import { usePermission, PermissionGate } from '../../context/AuthContext'

/** Convenience guard used at the top of each module page. */
export function usePageGuard(resource, action = 'view') {
  const ok = usePermission(resource, action)
  if (!ok) return <PermissionGate resource={resource} action={action} />
  return null
}

export function PageShell({ children, maxWidth }) {
  return (
    <div className="animate-fade-in" style={maxWidth ? { maxWidth } : undefined}>
      {children}
    </div>
  )
}