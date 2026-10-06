import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Code2, Lock, Pencil, RotateCcw, Send, ShieldCheck } from 'lucide-react'
import type { FieldPath } from '@/types'
import { api, type ShareResult } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi, useCitizen } from '@/hooks/useApi'
import { FIELD_INDEX, displayValue, fieldLabel, getField, groupBySection } from '@/lib/fields'
import { applyTransformation, mapToTarget, TRANSFORMATION_LABELS } from '@/lib/transform'
import DataFlow from '@/components/DataFlow'
import { ConfirmDialog } from '@/components/Modal'
import { ErrorState, Skeleton } from '@/components/ui'

export default function Apply() {
  const { serviceId = '' } = useParams()
  const [params] = useSearchParams()
  const consentId = params.get('consent')
  const navigate = useNavigate()
  const { session, toast, refresh } = useApp()
  const id = session!.citizen_id!

  const service = useApi(() => api.services.get(serviceId), [serviceId])
  const consents = useApi(() => api.consents.list(id), [id])
  const { citizen } = useCitizen()
  const consent = consents.data?.find((c) => c.consent_id === consentId && c.status === 'active')

  const [stage, setStage] = useState(0)
  const [share, setShare] = useState<ShareResult | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Partial<Record<FieldPath, string>>>({})
  const [editingField, setEditingField] = useState<FieldPath | null>(null)
  const [manual, setManual] = useState<Partial<Record<FieldPath, string>>>({})
  const [extra, setExtra] = useState<Record<string, string>>({})
  const [declared, setDeclared] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPayload, setShowPayload] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const started = useRef(false)

  // Run the integration layer once: read profile → verify & map → ready.
  const serviceReady = service.data?.service_id
  const consentReady = consent?.consent_id
  useEffect(() => {
    if (started.current || !service.data || !consent) return
    let cancelled = false
    setStage(1)
    const t = setTimeout(async () => {
      started.current = true
      setStage(2)
      try {
        const r = await api.integrationLayer.prepare(id, service.data!, consent.fields)
        if (cancelled) return
        setShare(r)
        setStage(3)
        refresh()
      } catch (e) {
        if (!cancelled) setShareError((e as Error).message)
      }
    }, 700)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceReady, consentReady, id])

  const s = service.data
  const shared = useMemo(() => new Set(consent?.fields ?? []), [consent])
  const allFields = useMemo(() => (s ? [...s.required_fields, ...s.optional_fields] : []), [s])
  const manualFields = useMemo(() => (s ? s.required_fields.filter((f) => !shared.has(f)) : []), [s, shared])

  /** Final payload in the target department's own field names. */
  const payload = useMemo(() => {
    if (!s || !citizen || !share) return {}
    const out: Record<string, string> = {}
    for (const m of share.mapped) {
      const v = overrides[m.standard_field] ?? m.source_value
      out[m.target_field] = applyTransformation(m.transformation, v, m.standard_field)
    }
    for (const m of mapToTarget(citizen, s, '', manualFields, [], manual)) out[m.target_field] = m.mapped_value
    for (const f of s.extra_fields) if (extra[f.key]) out[f.key] = extra[f.key]
    return out
  }, [s, citizen, share, overrides, manual, manualFields, extra])

  if (!consentId) return <Navigate to={`/services/${serviceId}`} replace />
  if (service.error) return <ErrorState message={service.error} />
  if (consents.data && !consent) {
    return (
      <ErrorState message="This consent is no longer active. Please start the application again from the service page." onRetry={() => navigate(`/services/${serviceId}`)} />
    )
  }
  if (!s || !citizen || !consent) return <div aria-busy="true"><Skeleton className="h-8 w-80" /><Skeleton className="mt-6 h-32" /><Skeleton className="mt-6 h-96" /></div>

  const validate = () => {
    const e: Record<string, string> = {}
    for (const f of manualFields) if (!manual[f]?.trim()) e[f] = `${fieldLabel(f)} is required.`
    for (const f of s.extra_fields) if (f.required && !extra[f.key]?.trim()) e[f.key] = `${f.label} is required.`
    if (!declared) e.declaration = 'Please confirm the declaration to submit.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    if (validate()) setConfirm(true)
    else toast('Some required information is missing.', 'error')
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const app = await api.applications.submit({ citizen_id: id, service: s, consent_id: consent.consent_id, payload })
      refresh()
      navigate(`/applications?id=${app.application_id}&new=1`, { replace: true })
    } catch (e) {
      toast((e as Error).message, 'error')
      setSubmitting(false)
      setConfirm(false)
    }
  }

  const ready = stage === 3

  return (
    <>
      <Link to={`/services/${s.service_id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" aria-hidden /> Back to service
      </Link>
      <h1 className="page-title">Apply: {s.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{s.department} · Consent <span className="font-mono">{consent.consent_id}</span></p>

      {/* Data sharing visualization */}
      <section className="card mt-6 p-5" aria-live="polite">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title flex items-center gap-2"><Lock className="size-4 text-brand-600" aria-hidden />Secure data sharing</h2>
          <span className="text-sm text-slate-500">
            {stage < 2 ? 'Reading approved fields from your profile…' : stage === 2 ? 'Verifying with source systems and mapping fields…' : 'Only approved fields were shared'}
          </span>
        </div>
        <DataFlow stage={stage} sharedCount={consent.fields.length} withheldCount={allFields.length - consent.fields.length} department={s.department} />
        {share && share.source_checks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {share.source_checks.map((c) => (
              <span key={c.integration} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${c.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                <CheckCircle2 className="size-3.5" aria-hidden />{c.integration} {c.ok ? `verified in ${c.latency}ms` : 'unavailable'}
              </span>
            ))}
          </div>
        )}
        {shareError && <p className="mt-3 text-sm text-red-700">{shareError}</p>}
      </section>

      {!ready ? (
        <div className="mt-6 space-y-3" aria-busy="true"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate>
          <div className="min-w-0 space-y-6">
            <section className="card">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="section-title">Application form</h2>
                <p className="text-sm text-slate-500">Pre-filled from your Unified Profile. Review each value; you can edit it for this application only.</p>
              </div>

              {groupBySection(allFields).map(({ section, fields }) => (
                <div key={section.key} className="border-b border-slate-100 px-5 py-4 last:border-0">
                  <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{section.title}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fields.map((f) => {
                      const isShared = shared.has(f)
                      const isRequired = s.required_fields.includes(f)
                      if (!isShared && !isRequired) return null // optional and withheld
                      const def = FIELD_INDEX[f]
                      if (isShared) {
                        const edited = overrides[f] !== undefined
                        const value = overrides[f] ?? getField(citizen, f)
                        return (
                          <div key={f} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-500">{fieldLabel(f)}</div>
                                {editingField === f ? (
                                  <FieldInput path={f} value={value} onChange={(v) => setOverrides((o) => ({ ...o, [f]: v }))} autoFocus />
                                ) : (
                                  <div className="mt-0.5 text-[15px] font-medium text-slate-900">{displayValue(f, value)}</div>
                                )}
                                <div className={`mt-1 text-xs font-medium ${edited ? 'text-amber-700' : 'text-emerald-700'}`}>
                                  {edited ? '✎ Edited for this application' : '✓ From Unified Profile'}
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                {edited && editingField !== f && (
                                  <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Reset ${fieldLabel(f)}`}
                                    onClick={() => setOverrides(({ [f]: _, ...o }) => o as typeof overrides)}>
                                    <RotateCcw className="size-4" />
                                  </button>
                                )}
                                <button type="button" className="rounded px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                                  onClick={() => setEditingField(editingField === f ? null : f)}>
                                  {editingField === f ? 'Done' : <span className="inline-flex items-center gap-1"><Pencil className="size-3" aria-hidden />Edit</span>}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div key={f} className="rounded-lg border border-dashed border-amber-300 bg-amber-50/40 p-3">
                          <label className="text-xs font-medium text-slate-700" htmlFor={`m-${f}`}>{fieldLabel(f)} <span className="text-red-600">*</span></label>
                          <FieldInput id={`m-${f}`} path={f} value={manual[f] ?? ''} onChange={(v) => setManual((m) => ({ ...m, [f]: v }))} invalid={!!errors[f]} options={def?.options} />
                          <div className="mt-1 text-xs text-amber-800">{getField(citizen, f) ? 'Not shared — enter manually' : 'Not in your profile — enter manually'}</div>
                          {errors[f] && <p className="mt-1 text-xs text-red-600">{errors[f]}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {s.extra_fields.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-4">
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Service-specific details</h3>
                  <p className="mb-3 text-xs text-slate-500">These are not part of your profile — only this department asks for them.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {s.extra_fields.map((f) => (
                      <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label htmlFor={`x-${f.key}`} className="label">{f.label}{f.required && <span className="text-red-600"> *</span>}</label>
                        {f.type === 'select' ? (
                          <select id={`x-${f.key}`} className="input" value={extra[f.key] ?? ''} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} aria-invalid={!!errors[f.key]}>
                            <option value="">Select…</option>
                            {f.options?.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        ) : f.type === 'textarea' ? (
                          <textarea id={`x-${f.key}`} className="input min-h-24" value={extra[f.key] ?? ''} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} />
                        ) : (
                          <input id={`x-${f.key}`} type={f.type} className="input" placeholder={f.placeholder} value={extra[f.key] ?? ''} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} aria-invalid={!!errors[f.key]} />
                        )}
                        {errors[f.key] && <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="card p-5">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" className="mt-0.5 size-4 accent-brand-600" checked={declared} onChange={(e) => { setDeclared(e.target.checked); setErrors(({ declaration: _, ...r }) => r) }} />
                I declare that the information above is true and correct to the best of my knowledge, and I authorise {s.department} to verify it with the issuing authorities.
              </label>
              {errors.declaration && <p className="mt-2 text-xs text-red-600">{errors.declaration}</p>}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="card p-5">
              <h2 className="section-title">Summary</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Auto-filled from profile</dt><dd className="font-semibold text-emerald-700 tabular-nums">{consent.fields.length - Object.keys(overrides).length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Edited for this application</dt><dd className="font-semibold tabular-nums">{Object.keys(overrides).length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Entered manually</dt><dd className="font-semibold tabular-nums">{manualFields.length + s.extra_fields.length}</dd></div>
              </dl>
              <button type="submit" className="btn-primary mt-5 w-full py-2.5"><Send className="size-4" aria-hidden />Submit Application</button>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500"><ShieldCheck className="mt-px size-3.5 shrink-0 text-emerald-600" aria-hidden />Edits here don't change your Unified Profile.</p>
            </section>

            <section className="card">
              <button type="button" onClick={() => setShowPayload((v) => !v)} className="flex w-full items-center justify-between px-5 py-3 text-left" aria-expanded={showPayload}>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Code2 className="size-4 text-slate-400" aria-hidden />What the department receives</span>
                {showPayload ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
              </button>
              {showPayload && (
                <div className="border-t border-slate-200 p-3">
                  <ul className="space-y-1.5">
                    {share!.mapped.map((m) => (
                      <li key={m.target_field} className="rounded-md bg-slate-50 px-2 py-1.5 text-xs">
                        <div className="flex justify-between gap-2"><code className="text-slate-500">{m.standard_field.split('.')[1]}</code><span className="text-slate-400">→</span><code className="font-semibold text-brand-800">{m.target_field}</code></div>
                        <div className="mt-0.5 flex justify-between gap-2 text-slate-600"><span className="truncate">"{payload[m.target_field]}"</span><span className="shrink-0 text-slate-400">{TRANSFORMATION_LABELS[m.transformation]}</span></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </aside>
        </form>
      )}

      <ConfirmDialog
        open={confirm}
        title="Submit this application?"
        message={<>Your application for <strong>{s.name}</strong> will be sent to {s.department}. You can track it under My Applications.</>}
        confirmLabel="Submit Application"
        busy={submitting}
        onConfirm={submit}
        onCancel={() => setConfirm(false)}
      />
    </>
  )
}

function FieldInput({ path, value, onChange, autoFocus, id, invalid, options }: { path: FieldPath; value: string; onChange: (v: string) => void; autoFocus?: boolean; id?: string; invalid?: boolean; options?: string[] }) {
  const def = FIELD_INDEX[path]
  const opts = options ?? def?.options
  if (opts) {
    return (
      <select id={id} className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} aria-invalid={invalid}>
        <option value="">Select…</option>
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input id={id} className="input mt-1" type={def?.input === 'date' ? 'date' : def?.input === 'number' ? 'number' : 'text'} value={value}
      onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus} aria-invalid={invalid} />
  )
}

