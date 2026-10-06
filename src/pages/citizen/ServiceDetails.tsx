import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, Building2, CheckCircle2, Clock, FileText, Gift, Info, ListChecks, MapPin, Send, ShieldCheck, XCircle,
} from 'lucide-react'
import type { FieldPath } from '@/types'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi, useCitizen } from '@/hooks/useApi'
import { evaluateRule, evaluateService } from '@/lib/eligibility'
import { displayValue, fieldLabel, getField, groupBySection } from '@/lib/fields'
import ConsentModal from '@/components/ConsentModal'
import StatusBadge, { Badge } from '@/components/StatusBadge'
import { CategoryIcon } from '@/components/categoryIcons'
import { ErrorState, Skeleton } from '@/components/ui'

export default function ServiceDetails() {
  const { serviceId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, toast, refresh } = useApp()
  const id = session!.citizen_id!
  const service = useApi(() => api.services.get(serviceId), [serviceId])
  const { citizen, documents, loading } = useCitizen()
  const apps = useApi(() => api.applications.list(id), [id])
  const [consentOpen, setConsentOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (params.get('apply') === '1' && service.data && citizen) {
      setConsentOpen(true)
      params.delete('apply')
      setParams(params, { replace: true })
    }
  }, [params, service.data, citizen, setParams])

  const result = useMemo(
    () => (service.data && citizen && documents ? evaluateService(citizen, service.data, documents) : null),
    [service.data, citizen, documents],
  )

  if (service.error) return <ErrorState message={service.error} />
  if (!service.data || loading || !citizen || !result) {
    return <div aria-busy="true"><Skeleton className="h-6 w-40" /><Skeleton className="mt-4 h-10 w-2/3" /><Skeleton className="mt-6 h-96" /></div>
  }

  const s = service.data
  const existing = apps.data?.find((a) => a.service_id === s.service_id && a.status !== 'Rejected')
  const required = s.required_fields
  const missing = required.filter((f) => !getField(citizen, f).trim())

  const allow = async (fields: FieldPath[]) => {
    setBusy(true)
    try {
      const consent = await api.consents.grant(id, s, fields)
      refresh()
      navigate(`/services/${s.service_id}/apply?consent=${consent.consent_id}`)
    } catch (e) {
      toast((e as Error).message, 'error')
      setBusy(false)
    }
  }

  const deny = async () => {
    await api.consents.deny(id, s)
    setConsentOpen(false)
    toast('Consent denied. No data was shared with the department.', 'info')
  }

  return (
    <>
      <Link to="/services" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" aria-hidden /> All services
      </Link>

      {/* Header */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <CategoryIcon category={s.category} className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={s.status} />
              <Badge tone="neutral">{s.category}</Badge>
              {result.eligible ? <Badge tone="success" icon={CheckCircle2}>Eligible · {result.score}% match</Badge> : <Badge tone="warning" icon={AlertTriangle}>{result.score}% match</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{s.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" aria-hidden />{s.department}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden />{s.processing_time}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{s.states.join(', ')}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 md:w-56">
            {existing ? (
              <>
                <Link to={`/applications?id=${existing.application_id}`} className="btn-primary">Track application</Link>
                <p className="text-center text-xs text-slate-500">Already applied · <span className="font-mono">{existing.application_id}</span></p>
              </>
            ) : s.status === 'Closed' ? (
              <button className="btn-primary" disabled>Applications closed</button>
            ) : (
              <>
                <button className="btn-primary py-2.5" onClick={() => setConsentOpen(true)}>
                  <Send className="size-4" aria-hidden />Apply with GovConnect
                </button>
                <p className="text-center text-xs text-slate-500">You'll review what's shared first</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="card p-5">
            <h2 className="section-title flex items-center gap-2"><Info className="size-4 text-slate-400" aria-hidden />Service Information</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.description}</p>
            <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900"><Gift className="size-4 text-slate-400" aria-hidden />Benefits</h3>
            <ul className="mt-2 space-y-1.5">
              {s.benefits.map((b) => <li key={b} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />{b}</li>)}
            </ul>
            <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900"><FileText className="size-4 text-slate-400" aria-hidden />Required documents</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {s.required_documents.map((d) => {
                const have = documents?.some((doc) => doc.verification_status === 'Verified' && (d.toLowerCase().includes(doc.document_type.toLowerCase()) || doc.document_type.toLowerCase().includes(d.toLowerCase())))
                return (
                  <li key={d} className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${have ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {have ? <CheckCircle2 className="size-3.5" aria-label="In your vault" /> : <FileText className="size-3.5" aria-hidden />}{d}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Required information vs profile */}
          <section className="card">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="section-title flex items-center gap-2"><ListChecks className="size-4 text-slate-400" aria-hidden />Required Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                This service requires {required.length} fields. GovConnect compared them with your Unified Citizen Profile.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {groupBySection(required).map(({ section, fields }) => (
                <div key={section.key} className="px-5 py-3">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{section.title}</div>
                  <ul>
                    {fields.map((f) => {
                      const v = getField(citizen, f)
                      return (
                        <li key={f} className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:items-center sm:gap-3">
                          <span className="flex items-center gap-2 text-sm font-medium text-slate-800 sm:w-48">
                            {v ? <CheckCircle2 className="size-4 text-emerald-600" aria-hidden /> : <AlertTriangle className="size-4 text-amber-500" aria-hidden />}
                            {fieldLabel(f)}
                          </span>
                          {v ? (
                            <span className="flex flex-1 items-center justify-between gap-2 pl-6 text-sm sm:pl-0">
                              <span className="truncate text-slate-600">{displayValue(f, v)}</span>
                              <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Available from your profile</span>
                            </span>
                          ) : (
                            <span className="flex flex-1 items-center justify-between gap-2 pl-6 text-sm sm:pl-0">
                              <span className="text-xs font-medium text-amber-700">⚠ Information required</span>
                              <Link to="/profile" className="text-xs font-medium text-brand-700 hover:underline">Complete Profile</Link>
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className={`flex items-center gap-2 border-t px-5 py-3 text-sm ${missing.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
              {missing.length ? <AlertTriangle className="size-4 shrink-0" aria-hidden /> : <CheckCircle2 className="size-4 shrink-0" aria-hidden />}
              {missing.length
                ? `${missing.length} field${missing.length > 1 ? 's are' : ' is'} missing. Complete your profile, or enter ${missing.length > 1 ? 'them' : 'it'} manually on the application.`
                : `All ${required.length} required fields are available — your application will be pre-filled.`}
            </div>
          </section>
        </div>

        {/* Eligibility */}
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="section-title">Eligibility Check</h2>
            <p className="mt-1 text-sm text-slate-500">{s.eligibility_summary}</p>
            <ul className="mt-4 space-y-2.5">
              {s.eligibility_rules.map((r) => {
                const res = evaluateRule(citizen, r)
                return (
                  <li key={r.label + r.op} className="flex items-start gap-2 text-sm">
                    {res === 'met' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Met" />
                      : res === 'unmet' ? <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-label="Not met" />
                      : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-label="Unknown" />}
                    <span className={res === 'met' ? 'text-slate-700' : 'text-slate-500'}>
                      {r.label}
                      {res === 'unknown' && <span className="block text-xs text-amber-700">Add {fieldLabel(r.field)} to your profile</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className={`mt-4 rounded-lg p-3 text-sm font-medium ${result.eligible ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
              {result.eligible ? 'You meet all eligibility criteria.' : 'You may not meet every criterion. You can still apply; the department makes the final decision.'}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title flex items-center gap-2"><ShieldCheck className="size-4 text-brand-600" aria-hidden />How your data is shared</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-600">
              {['You choose which fields to share on the consent screen.', 'GovConnect maps them to the department\'s own field names.', 'Only approved fields are delivered; everything is audit-logged.', 'You can revoke access any time from Permissions.'].map((t, i) => (
                <li key={t} className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <ConsentModal open={consentOpen} service={s} citizen={citizen} busy={busy} onAllow={allow} onDeny={deny} onCancel={() => setConsentOpen(false)} />
    </>
  )
}
