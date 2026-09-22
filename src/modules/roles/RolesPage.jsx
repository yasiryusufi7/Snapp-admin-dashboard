import { useMemo, useState } from 'react'
import { Check, Lock, Shield, ShieldCheck, ShieldEllipsis, UserPlus, Zap } from 'lucide-react'
import { ROLES, ACTIONS } from '../../data/roles'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'

const TOKEN = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  brand: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
  slash: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
}

const ALL_RESOURCES = [
  'dashboard', 'liveOps', 'passengers', 'drivers', 'vehicles', 'trips', 'bookings',
  'payments', 'wallet', 'fareRules', 'commissions', 'cities', 'campaigns', 'notifications',
  'complaints', 'reports', 'analytics', 'exports', 'roles', 'auditLogs', 'settings',
]

export default function RolesPage() {
  const guard = usePageGuard('roles')
  if (guard) return guard

  const { toast } = useToast()
  const [roleId, setRoleId] = useState('operations_manager')
  const [matrix, setMatrix] = useState({})
  const [dirty, setDirty] = useState(false)
  const [inviting, setInviting] = useState(false)

  const role = ROLES.find((r) => r.id === roleId)

  const current = useMemo(
    () => matrix[roleId] || role.permissions,
    [matrix, roleId, role],
  )

  const has = (resource, action) => current[resource]?.includes(action)

  const toggle = (resource, action) => {
    setMatrix((prev) => {
      const base = prev[roleId] || { ...Object.fromEntries(ALL_RESOURCES.map((r) => [r, [...(role.permissions[r] || [])]])) }
      const next = { ...base }
      const perms = [...(next[resource] || [])]
      if (perms.includes(action)) next[resource] = perms.filter((a) => a !== action)
      else next[resource] = [...perms, action]
      return { ...prev, [roleId]: next }
    })
    setDirty(true)
  }

  const save = () => {
    setDirty(false)
    toast({ title: 'Permission matrix saved', description: `${role.label} updated and propagated.`, tone: 'success' })
  }

  const grantCount = (permissions) => Object.values(permissions).reduce((s, p) => s + p.length, 0)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Roles & Permissions"
        description="RBAC matrix: map capabilities to roles across 21 resources."
        actions={<Button icon={UserPlus} onClick={() => setInviting(true)}>Invite member</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Role list */}
        <div className="flex flex-col gap-2">
          {ROLES.map((r) => {
            const count = grantCount(r.permissions)
            const active = r.id === roleId
            return (
              <button
                key={r.id}
                onClick={() => setRoleId(r.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/40' : 'border-line bg-surface hover:border-line-strong'}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TOKEN[r.color]}`}>
                  {r.id === 'super_admin' ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{r.label}</p>
                  <p className="truncate text-xs text-ink-soft">{r.description}</p>
                </div>
                <div className="text-right">
                  <Badge tone="slate">{r.members}</Badge>
                  <p className="mt-1 text-[10px] font-semibold text-ink-faint text-tabular">{count} grants</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Matrix */}
        <div className="card-surface">
          <CardHeader
            icon={ShieldEllipsis}
            title={`${role?.label} permission matrix`}
            description="Check/un-check capabilities. Super Admin is fixed."
            actions={dirty && <Badge tone="amber">unsaved changes</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-semibold">Resource</th>
                  {ACTIONS.map((a) => (
                    <th key={a.key} className="w-16 px-2 py-2.5 text-center font-semibold">{a.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {ALL_RESOURCES.map((res) => (
                  <tr key={res} className={role.id === 'super_admin' ? 'opacity-60' : 'transition-colors hover:bg-surface2/40'}>
                    <td className="px-5 py-2 capitalize text-ink">{res.replace(/([A-Z])/g, ' $1').toLowerCase()}</td>
                    {ACTIONS.map((a) => {
                      const on = role.id === 'super_admin' || has(res, a.key)
                      return (
                        <td key={a.key} className="px-2 py-2 text-center">
                          <button
                            disabled={role.id === 'super_admin'}
                            onClick={() => toggle(res, a.key)}
                            aria-label={`${res} ${a.label}`}
                            className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition ${on ? 'border-brand-500 bg-brand-600 text-white' : 'border-line bg-surface2 text-transparent hover:border-line-strong'}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3.5">
            {role.id === 'super_admin' && (
              <p className="mr-auto flex items-center gap-1.5 text-xs text-ink-faint"><Lock className="h-3.5 w-3.5" />Immutable role</p>
            )}
            <Button variant="secondary" onClick={() => { setMatrix((prev) => { delete prev[roleId]; return { ...prev } }); setDirty(false) }} disabled={!dirty}>Discard</Button>
            <Button icon={Zap} onClick={save} disabled={!dirty}>Save matrix</Button>
          </div>
        </div>
      </div>

      {inviting && <InviteModal onClose={() => setInviting(false)} onInvite={() => { setInviting(false); toast({ title: 'Invite sent', description: 'Member invited with email delivery.', tone: 'success' }) }} />}
    </div>
  )
}

function InviteModal({ onClose, onInvite }) {
  return (
    <Modal open onClose={onClose} title="Invite team member" description="They'll receive a secure setup link" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button icon={UserPlus} onClick={onInvite}>Send invite</Button>
      </>
    }>
      <div className="space-y-4">
        <Field label="Email" required>
          <Input type="email" placeholder="colleague@snapp.com" />
        </Field>
        <Field label="Role">
          <select className="focus-ring h-9.5 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink">
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <div className="flex items-start gap-2 rounded-lg bg-surface2/70 px-3 py-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
          <p className="text-xs leading-relaxed text-ink-soft">Invitations expire in 7 days. Access can be revoked any time from the audit trail.</p>
        </div>
      </div>
    </Modal>
  )
}