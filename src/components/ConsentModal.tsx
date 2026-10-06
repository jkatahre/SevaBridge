import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Building2, Clock, Lock, ShieldCheck, Target } from 'lucide-react'
import type { Citizen, FieldPath, Service } from '@/types'
import { displayValue, fieldLabel, getField, groupBySection } from '@/lib/fields'
import Modal from './Modal'
import { Spinner } from './ui'

interface Props {
  open: boolean
  service: Service
  citizen: Citizen
  busy?: boolean
  onAllow: (fields: FieldPath[]) => void
  onDeny: () => void
  onCancel: () => void
}

/**
 * Field-level consent. Required fields start selected, optional ones start
 * unselected, and fields missing from the profile cannot be shared.
 */
export default function ConsentModal({ open, service, citizen, busy, onAllow, onDeny, onCancel }: Props) {
  const all = useMemo(() => [...service.required_fields, ...service.optional_fields], [service])
  const available = (f: FieldPath) => getField(citizen, f).trim() !== ''
  const [selected, setSelected] = useState<Set<FieldPath>>(new Set())

  useEffect(() => {
    if (open) setSelected(new Set(service.required_fields.filter(available)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service])

  const toggle = (f: FieldPath) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(f)) n.delete(f)
      else n.add(f)
      return n
    })

  const withheldRequired = service.required_fields.filter((f) => !selected.has(f))
  const groups = groupBySection(all)

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="lg"
      locked={busy}
      title={
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand-600" aria-hidden />
          {service.department} requests access
        </span>
      }
      description={`For: ${service.name}`}
      footer={
        <>
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn-danger" onClick={onDeny} disabled={busy}>Deny</button>
          <button className="btn-primary" onClick={() => onAllow(all.filter((f) => selected.has(f)))} disabled={busy || selected.size === 0}>
            {busy ? <><Spinner /> Sharing securely…</> : <>Allow Selected ({selected.size})</>}
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Fact icon={Target} label="Purpose" value={service.purpose} className="sm:col-span-3" />
        <Fact icon={Building2} label="Recipient" value={service.department} />
        <Fact icon={Clock} label="Valid for" value="180 days" />
        <Fact icon={Lock} label="Shared via" value="GovConnect Integration Layer" />
      </div>

      <div className="mt-5 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Requested information</h3>
        <div className="flex gap-3 text-xs">
          <button className="font-medium text-brand-700 hover:underline" onClick={() => setSelected(new Set(all.filter(available)))}>Select all</button>
          <button className="font-medium text-slate-500 hover:underline" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      </div>

      <div className="mt-2 space-y-3">
        {groups.map(({ section, fields }) => (
          <fieldset key={section.key} className="rounded-lg border border-slate-200">
            <legend className="ml-3 px-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{section.title}</legend>
            <ul className="divide-y divide-slate-100">
              {fields.map((f) => {
                const ok = available(f)
                const required = service.required_fields.includes(f)
                return (
                  <li key={f}>
                    <label className={`flex items-center gap-3 px-3 py-2.5 ${ok ? 'cursor-pointer hover:bg-slate-50' : 'opacity-60'}`}>
                      <input
                        type="checkbox"
                        className="size-4 rounded border-slate-300 accent-brand-600"
                        checked={selected.has(f)}
                        disabled={!ok || busy}
                        onChange={() => toggle(f)}
                      />
                      <span className="flex-1 text-sm text-slate-800">
                        {fieldLabel(f)}
                        <span className={`ml-2 text-[11px] font-medium ${required ? 'text-slate-500' : 'text-sky-700'}`}>{required ? 'Required' : 'Optional'}</span>
                      </span>
                      <span className="max-w-[45%] truncate text-right text-xs text-slate-500">
                        {ok ? displayValue(f, getField(citizen, f)) : 'Not in profile'}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {withheldRequired.length > 0 && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            You are not sharing {withheldRequired.length} required field{withheldRequired.length > 1 ? 's' : ''}. You'll need to enter
            {withheldRequired.length > 1 ? ' them' : ' it'} manually on the application form.
          </p>
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
        Only the fields you select are shared. You can revoke this permission later from Privacy &amp; Permissions.
      </p>
    </Modal>
  )
}

function Fact({ icon: Icon, label, value, className = '' }: { icon: typeof Target; label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-lg bg-slate-50 p-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-800">{value}</div>
    </div>
  )
}
