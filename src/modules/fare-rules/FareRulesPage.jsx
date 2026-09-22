import { useMemo, useState } from 'react'
import { Calculator, MapPinned, ReceiptText, TimerReset } from 'lucide-react'
import { db } from '../../data/db'
import { fmtCurrency } from '../../utils/format'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/navigation/PageHeader'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Select, Input } from '../../components/ui/Input'
import { usePageGuard } from '../../components/common/PageGuard'

function estimate(rule, { km, min, waitMin, night, peak }) {
  const base = rule.base
  const distance = km * rule.perKm
  const time = min * rule.perMin
  const wait = waitMin * rule.waitingPerMin
  const subtotal = base + distance + time + wait
  let surge = 0
  if (night && rule.nightMultiplier > 1) surge += subtotal * (rule.nightMultiplier - 1)
  if (peak && rule.peakMultiplier > 1) surge += subtotal * (rule.peakMultiplier - 1)
  const total = Math.max(subtotal + surge, rule.minimum)
  return { base, distance, time, wait, surge, total }
}

export default function FareRulesPage() {
  const guard = usePageGuard('fareRules')
  if (guard) return guard

  const { toast } = useToast()
  const [scope, setScope] = useState('all')
  const cities = [...new Set(db.fareRules.map((r) => r.city))]

  const rules = useMemo(() => {
    const rows = db.fareRules
    if (scope === 'all') return rows
    return rows.filter((r) => r.city === scope)
  }, [scope])

  const [selected, setSelected] = useState(rules[0]?.id || db.fareRules[0]?.id)
  const rule = db.fareRules.find((r) => r.id === (selected || rules[0]?.id)) || db.fareRules[0]

  const [km, setKm] = useState(7)
  const [min, setMin] = useState(14)
  const [wait, setWait] = useState(2)
  const [night, setNight] = useState(false)
  const [peak, setPeak] = useState(true)
  const breakdown = estimate(rule, { km, min, waitMin: wait, night, peak })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Fare Rules"
        description="Per-city pricing tables: distance, time, waiting, surges and airport surcharges."
        actions={
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5">
            {['all', ...cities].map((c) => (
              <button key={c} onClick={() => setScope(c)} className={`rounded-md px-2 py-1 text-xs font-semibold capitalize transition ${scope === c ? 'bg-brand-600 text-white' : 'text-ink-soft hover:text-ink'}`}>{c === 'all' ? 'All cities' : c}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Fare calculator */}
        <Card>
          <CardHeader icon={Calculator} title="Fare estimator" description="Instant quote using the selected rule" />
          <CardBody className="p-5">
            <Field label="City · Vehicle">
              <Select value={rule.id} onChange={(e) => setSelected(e.target.value)}>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>{r.city} · {r.vehicleType} ({fmtCurrency(r.base)} base)</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Distance (km)"><Input type="number" min={1} value={km} onChange={(e) => setKm(Number(e.target.value))} /></Field>
              <Field label="Time (min)"><Input type="number" min={1} value={min} onChange={(e) => setMin(Number(e.target.value))} /></Field>
              <Field label="Waiting (min)"><Input type="number" min={0} value={wait} onChange={(e) => setWait(Number(e.target.value))} /></Field>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ToggleLabel checked={night} onChange={setNight} label="Night (×1.25)" />
              <ToggleLabel checked={peak} onChange={setPeak} label="Peak 18–22 (×1.15)" />
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-line p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Estimate</p>
              {[
                ['Base', breakdown.base],
                ['Distance', breakdown.distance],
                ['Time', breakdown.time],
                ['Waiting', breakdown.wait],
                [(night || peak ? 'Surge' : 'Surge'), breakdown.surge, 'text-brand-600 dark:text-brand-300'],
                ['Minimum floor', rule.minimum > 0 ? `applied if below ${fmtCurrency(rule.minimum)}` : '—', 'text-ink-faint'],
              ].map(([label, value, tone]) => (
                <div key={label} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-soft">{label}</span>
                  <span className={`font-semibold text-tabular ${tone || 'text-ink'}`}>{typeof value === 'string' ? value : fmtCurrency(value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-line pt-2.5">
                <span className="text-sm font-medium text-ink">Estimated fare</span>
                <span className="text-xl font-bold text-ink text-tabular">{fmtCurrency(breakdown.total)}</span>
              </div>
              <Button variant="secondary" fullWidth icon={ReceiptText} onClick={() => toast({ title: 'Quote copied', description: `${fmtCurrency(breakdown.total)} for ${km}km / ${min}min ${rule.city} ${rule.vehicleType}.`, tone: 'success' })}>Copy quote</Button>
            </div>
          </CardBody>
        </Card>

        {/* Rules table */}
        <Card className="lg:col-span-2">
          <CardHeader icon={MapPinned} title="Pricing tables" description={`${rules.length} active rules`} />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-semibold">City · Type</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Base</th>
                  <th className="px-3 py-2.5 text-right font-semibold">per km</th>
                  <th className="px-3 py-2.5 text-right font-semibold">per min</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Minimum</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Cancel fee</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Airport</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {rules.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r.id)} className={`cursor-pointer transition-colors hover:bg-surface2/50 ${rule.id === r.id ? 'bg-brand-500/5' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium capitalize text-ink">{r.city} <span className="text-ink-faint">·</span> <Badge tone={r.vehicleType === 'executive' ? 'violet' : r.vehicleType === 'eco' ? 'green' : 'slate'}>{r.vehicleType}</Badge></p>
                      <p className="font-mono text-[10.5px] text-ink-faint">{r.id}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-tabular"><span className="font-semibold text-ink">{r.base}</span></td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{r.perKm}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{r.perMin}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{r.minimum}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{r.cancellationFee}</td>
                    <td className="px-3 py-3 text-right text-ink-soft text-tabular">{r.airportSurcharge}</td>
                    <td className="px-5 py-3 text-right"><Badge tone="green">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon={TimerReset} title="Dynamic multipliers" description="Applied on top of the base table" />
        <CardBody className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Night multiplier', value: `×${rule.nightMultiplier}`, meta: `${rule.nightStart}:00 – ${rule.nightEnd}:00` },
              { label: 'Peak multiplier', value: `×${rule.peakMultiplier}`, meta: `${rule.peakStart}:00 – ${rule.peakEnd}:00` },
              { label: 'Waiting rate', value: `${rule.waitingPerMin} AFN/min`, meta: 'after 1 min' },
              { label: 'Cancellation fee', value: `${rule.cancellationFee} AFN`, meta: `${rule.city} · ${rule.vehicleType}` },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-line p-4">
                <p className="text-[11px] text-ink-faint">{m.label}</p>
                <p className="mt-1 text-lg font-bold text-ink text-tabular">{m.value}</p>
                <p className="text-[11px] text-ink-soft">{m.meta}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function ToggleLabel({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] font-medium transition ${checked ? 'border-brand-500/50 bg-brand-500/8 text-brand-700 dark:text-brand-200' : 'border-line text-ink-soft hover:border-slate-300'}`}>
      {label}
      <span className={`relative h-4 w-7 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-surface3'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${checked ? 'left-3.5' : 'left-0.5'}`} />
      </span>
    </button>
  )
}