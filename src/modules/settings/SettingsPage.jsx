import { useEffect, useState } from 'react'
import { Building2, Check, Globe2, Landmark, LockKeyhole, Megaphone, RefreshCcw, ShieldCheck, TerminalSquare } from 'lucide-react'
import { settingsService } from '../../services/settingsService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Switch } from '../../components/ui/Switch'
import { Divider } from '../../components/ui/ProgressBar'
import { usePageGuard } from '../../components/common/PageGuard'

const TABS = [
  { key: 'general', label: 'General', icon: Building2 },
  { key: 'operations', label: 'Operations', icon: RefreshCcw },
  { key: 'pricing', label: 'Pricing', icon: Landmark },
  { key: 'notifications', label: 'Notifications', icon: Megaphone },
  { key: 'security', label: 'Security', icon: LockKeyhole },
  { key: 'system', label: 'System', icon: TerminalSquare },
]

export default function SettingsPage() {
  const guard = usePageGuard('settings')
  if (guard) return guard

  const { data: remote } = useAsync(() => settingsService.get(), [])
  const [tab, setTab] = useState('general')
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (remote) setDraft(structuredClone(remote))
  }, [remote])

  if (!draft) return <div className="h-40 animate-pulse" />

  const set = (key, value) => setDraft((d) => ({ ...d, [tab]: { ...d[tab], [key]: value } }))

  const save = async () => {
    setSaving(true)
    await settingsService.save(tab, draft[tab])
    setSaving(false)
    toast({ title: 'Settings saved', description: `${TABS.find((t) => t.key === tab)?.label} configuration updated.`, tone: 'success' })
  }

  const g = draft[tab]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Settings"
        description="Platform configuration across company, operations, pricing and security."
        actions={<Button icon={Check} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface2 p-1 lg:flex-col lg:overflow-visible lg:self-start lg:p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors duration-150 ${tab === t.key ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-ink-faint hover:text-ink-soft hover:bg-surface/60'}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tab === 'general' && (
            <Card>
              <CardHeader icon={Building2} title="Company profile" description="Shown on invoices and public surfaces" />
              <CardBody className="space-y-4 p-5">
                <Field label="Company name">
                  <Input value={g.companyName} onChange={(e) => set('companyName', e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Support email"><Input value={g.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></Field>
                  <Field label="Support phone"><Input value={g.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Currency">
                    <Select value={g.currency} onChange={(e) => set('currency', e.target.value)}>
                      <option value="AFN">AFN</option><option value="USD">USD</option><option value="EUR">EUR</option>
                    </Select>
                  </Field>
                  <Field label="Timezone">
                    <Select value={g.timezone} onChange={(e) => set('timezone', e.target.value)}>
                      <option>UTC+4:30 (Kabul)</option><option>UTC+0</option><option>UTC+1</option>
                    </Select>
                  </Field>
                  <Field label="Locale">
                    <Select value={g.language} onChange={(e) => set('language', e.target.value)}>
                      <option value="en-AF">en-AF</option><option value="ps-AF">ps-AF</option>
                    </Select>
                  </Field>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'operations' && (
            <Card>
              <CardHeader icon={RefreshCcw} title="Dispatch rules" description="How requests are offered to drivers" />
              <CardBody className="space-y-4 p-5">
                <Row label="Auto-assignment" hint="Offer requests to nearest available driver automatically"><Switch checked={g.autoAssign} onChange={(v) => set('autoAssign', v)} /></Row>
                <Divider />
                <Row label="Cash payments allowed"><Switch checked={g.allowCash} onChange={(v) => set('allowCash', v)} /></Row>
                <Divider />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Max dispatch radius (km)"><Input type="number" min={1} value={g.maxDispatchRadiusKm} onChange={(e) => set('maxDispatchRadiusKm', Number(e.target.value))} /></Field>
                  <Field label="No-show grace (min)"><Input type="number" min={1} value={g.noShowGraceMin} onChange={(e) => set('noShowGraceMin', Number(e.target.value))} /></Field>
                  <Field label="Cancel free window (min)"><Input type="number" min={0} value={g.cancelFreeWindowMin} onChange={(e) => set('cancelFreeWindowMin', Number(e.target.value))} /></Field>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'pricing' && (
            <Card>
              <CardHeader icon={Landmark} title="Pricing behaviour" description="Rounding and surge policy across cities" />
              <CardBody className="space-y-4 p-5">
                <Row label="Dynamic surge pricing" hint="Multiplier caps apply via fare rules"><Switch checked={g.surgeEnabled} onChange={(v) => set('surgeEnabled', v)} /></Row>
                <Divider />
                <div className="grid max-w-md grid-cols-2 gap-3">
                  <Field label="Round fares to nearest (AFN)">
                    <Select value={String(g.roundFareToNearest)} onChange={(e) => set('roundFareToNearest', Number(e.target.value))}>
                      <option value="1">1</option><option value="5">5</option><option value="10">10</option>
                    </Select>
                  </Field>
                  <Field label="Max surge multiplier"><Input type="number" step={0.1} min={1} value={g.surgeCap} onChange={(e) => set('surgeCap', Number(e.target.value))} /></Field>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardHeader icon={Megaphone} title="Outreach channels" description="Which channels are active for broadcasts" />
              <CardBody className="space-y-4 p-5">
                <Row label="Email delivery" hint="Transactional receipts and digests"><Switch checked={g.emailEnabled} onChange={(v) => set('emailEnabled', v)} /></Row>
                <Divider />
                <Row label="SMS delivery"><Switch checked={g.smsEnabled} onChange={(v) => set('smsEnabled', v)} /></Row>
                <Divider />
                <Row label="Push notifications"><Switch checked={g.pushEnabled} onChange={(v) => set('pushEnabled', v)} /></Row>
                <Divider />
                <Field label="Driver SMS monthly quota"><Input type="number" value={g.driverSmsQuota} onChange={(e) => set('driverSmsQuota', Number(e.target.value))} /></Field>
              </CardBody>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <CardHeader icon={LockKeyhole} title="Access security" description="Password, session and MFA policy" />
              <CardBody className="space-y-4 p-5">
                <Row label="Require two-factor auth" hint="Enforced for all admin roles"><Switch checked={g.twoFactor} onChange={(v) => set('twoFactor', v)} /></Row>
                <Divider />
                <Row label="IP allow-listing for console"><Switch checked={g.ipRestriction} onChange={(v) => set('ipRestriction', v)} /></Row>
                <Divider />
                <div className="grid max-w-md grid-cols-3 gap-3">
                  <Field label="Min password length"><Input type="number" value={g.minPasswordLength} onChange={(e) => set('minPasswordLength', Number(e.target.value))} /></Field>
                  <Field label="Session (hours)"><Input type="number" value={g.sessionHours} onChange={(e) => set('sessionHours', Number(e.target.value))} /></Field>
                  <Field label="Pwd expiry (days)"><Input type="number" value={g.passwordExpiryDays} onChange={(e) => set('passwordExpiryDays', Number(e.target.value))} /></Field>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === 'system' && (
            <Card>
              <CardHeader icon={TerminalSquare} title="System controls" description="Maintenance and compatibility toggles" />
              <CardBody className="space-y-4 p-5">
                <Row label="Maintenance mode" hint="Blocks driver ride acceptance while enabled"><Switch checked={g.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} /></Row>
                <Divider />
                <Row label="Legacy API compatibility"><Switch checked={g.legacyApi} onChange={(v) => set('legacyApi', v)} /></Row>
                <Divider />
                <Row label="Verbose debug logging"><Switch checked={g.debugLogs} onChange={(v) => set('debugLogs', v)} /></Row>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Compliance snapshot</p>
                      <p className="text-xs text-ink-soft">SOC 2 type II · ISO 27001 · GDPR Data Processing Addendum current.</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" icon={Globe2} onClick={() => toast({ title: 'Compliance report', description: 'Latest attestations opened in a new view.', tone: 'info' })}>View report</Button>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button icon={Check} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      </div>
      {children}
    </div>
  )
}