import type { Citizen } from '@/types'
import { displayValue, getField, type SectionDef } from '@/lib/fields'
import { AlertCircle } from 'lucide-react'

interface Props {
  section: SectionDef
  citizen: Citizen
  editing: boolean
  errors?: Record<string, string>
  onChange: (path: string, value: string | boolean) => void
}

/** Renders one section of the Unified Citizen Profile in view or edit mode. */
export default function ProfileSection({ section, citizen, editing, errors = {}, onChange }: Props) {
  return (
    <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
      {section.fields.map((f) => {
        const raw = getField(citizen, f.path)
        const id = `f-${f.path.replace('.', '-')}`
        const err = errors[f.path]
        const missing = f.required && !raw.trim()

        if (f.input === 'toggle') {
          const on = raw === 'true'
          return (
            <div key={f.path} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 sm:col-span-1">
              <label htmlFor={id} className="text-sm font-medium text-slate-700">{f.label}</label>
              <button
                id={id}
                type="button"
                role="switch"
                aria-checked={on}
                disabled={!editing}
                onClick={() => onChange(f.path, !on)}
                className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${on ? 'bg-brand-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          )
        }

        return (
          <div key={f.path} className={f.wide ? 'sm:col-span-2' : ''}>
            <label htmlFor={id} className="label">
              {f.label}
              {f.required && editing && <span className="text-red-600"> *</span>}
            </label>
            {editing ? (
              f.input === 'select' ? (
                <select id={id} className="input" value={raw} onChange={(e) => onChange(f.path, e.target.value)} aria-invalid={!!err}>
                  <option value="">Select…</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  id={id}
                  className={`input ${err ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                  type={f.input}
                  value={raw}
                  placeholder={f.placeholder}
                  step={f.path === 'education.cgpa' ? '0.01' : undefined}
                  onChange={(e) => onChange(f.path, e.target.value)}
                  aria-invalid={!!err}
                  aria-describedby={err ? `${id}-err` : undefined}
                />
              )
            ) : (
              <div className={`flex min-h-[38px] items-center rounded-lg px-3 py-2 text-sm ${missing ? 'border border-dashed border-amber-300 bg-amber-50/50 text-amber-800' : 'bg-slate-50 text-slate-900'}`}>
                {missing ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium"><AlertCircle className="size-3.5" aria-hidden />Not provided</span>
                ) : (
                  displayValue(f.path, raw)
                )}
              </div>
            )}
            {err && <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{err}</p>}
          </div>
        )
      })}
    </div>
  )
}
