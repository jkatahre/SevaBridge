import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock, Pencil, Save, ShieldCheck, X } from 'lucide-react'
import type { Citizen, ProfileSectionKey } from '@/types'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useCitizen } from '@/hooks/useApi'
import ProfileSection from '@/components/ProfileSection'
import ProgressBar from '@/components/ProgressBar'
import StatusBadge from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/Modal'
import { ErrorState, PageHeader, Skeleton, Spinner } from '@/components/ui'
import { PROFILE_SECTIONS, formatDate, setField } from '@/lib/fields'
import { computeCompletion } from '@/lib/profileCompletion'

function validate(c: Citizen): Record<string, string> {
  const e: Record<string, string> = {}
  const { contact_info: ct, address: a, education: ed, financial_info: fi, personal_info: p } = c
  if (ct.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ct.email)) e['contact_info.email'] = 'Enter a valid email address.'
  if (ct.phone && ct.phone.replace(/\D/g, '').length < 10) e['contact_info.phone'] = 'Phone number must have at least 10 digits.'
  if (ct.alternate_phone && ct.alternate_phone.replace(/\D/g, '').length < 10) e['contact_info.alternate_phone'] = 'Phone number must have at least 10 digits.'
  if (a.pincode && !/^\d{6}$/.test(a.pincode)) e['address.pincode'] = 'Pincode must be exactly 6 digits.'
  if (ed.cgpa && (Number(ed.cgpa) < 0 || Number(ed.cgpa) > 10)) e['education.cgpa'] = 'CGPA must be between 0 and 10.'
  if (ed.enrollment_year && ed.passing_year && Number(ed.passing_year) < Number(ed.enrollment_year)) e['education.passing_year'] = 'Passing year cannot be before enrollment year.'
  if (fi.annual_income && Number(fi.annual_income) < 0) e['financial_info.annual_income'] = 'Income cannot be negative.'
  if (p.date_of_birth && new Date(p.date_of_birth) > new Date()) e['personal_info.date_of_birth'] = 'Date of birth cannot be in the future.'
  return e
}

export default function Profile() {
  const { refresh, toast } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const onboarding = params.get('onboarding') === '1'
  const { citizen, documents, loading, error } = useCitizen()

  const [tab, setTab] = useState<ProfileSectionKey>('personal_info')
  const [editing, setEditing] = useState(onboarding)
  const [draft, setDraft] = useState<Citizen | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (citizen && !draft) setDraft(citizen)
  }, [citizen, draft])

  const view = editing ? draft : citizen
  const completion = useMemo(() => (view && documents ? computeCompletion(view, documents) : null), [view, documents])
  const dirty = editing && draft && citizen && JSON.stringify(draft) !== JSON.stringify(citizen)

  if (error) return <ErrorState message={error} />
  if (loading || !view || !completion || !citizen) {
    return <div aria-busy="true"><Skeleton className="h-8 w-72" /><Skeleton className="mt-6 h-[480px]" /></div>
  }

  const section = PROFILE_SECTIONS.find((s) => s.key === tab)!
  const stepIndex = PROFILE_SECTIONS.findIndex((s) => s.key === tab)
  const sectionState = (key: string) => completion.sections.find((s) => s.key === key)

  const onChange = (path: string, value: string | boolean) => {
    setDraft((d) => {
      if (!d) return d
      let next = setField(d, path, value)
      // Keep full_name in sync with name parts while editing.
      if (path.startsWith('personal_info.') && path !== 'personal_info.full_name' && /(first|middle|last)_name/.test(path)) {
        const p = next.personal_info
        next = setField(next, 'personal_info.full_name', [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' '))
      }
      return next
    })
    setErrors((e) => {
      if (!e[path]) return e
      const { [path]: _, ...rest } = e
      return rest
    })
  }

  const save = async (then?: () => void, silent = false) => {
    if (!draft) return
    const errs = validate(draft)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      setTab(first.split('.')[0] as ProfileSectionKey)
      toast('Please fix the highlighted fields before saving.', 'error')
      return
    }
    setSaving(true)
    try {
      const saved = await api.citizens.update(draft, { silent })
      setDraft(saved)
      refresh()
      if (then) then()
      else {
        setEditing(false)
        toast('Profile saved. Departments you have consented to will see the updated values.')
      }
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setDraft(citizen)
    setErrors({})
    setEditing(false)
    setConfirmDiscard(false)
  }

  const nextStep = () => {
    if (stepIndex < PROFILE_SECTIONS.length - 1) {
      save(() => {
        setTab(PROFILE_SECTIONS[stepIndex + 1].key)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, true)
    } else {
      save(() => {
        toast('Your Unified Citizen Profile is ready. Here are the schemes you match.')
        navigate('/schemes')
      })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={onboarding ? `Step ${stepIndex + 1} of ${PROFILE_SECTIONS.length}` : undefined}
        title={onboarding ? 'Complete Your Citizen Profile' : 'Unified Citizen Profile'}
        description={
          onboarding
            ? 'Fill in your details once. GovConnect reuses them — only with your consent — across every connected service.'
            : 'Your single, standardized record. Services request fields from here, so you never re-enter the same details.'
        }
        actions={
          !onboarding &&
          (editing ? (
            <>
              <button className="btn-secondary" onClick={() => (dirty ? setConfirmDiscard(true) : cancel())} disabled={saving}><X className="size-4" aria-hidden />Cancel</button>
              <button className="btn-primary" onClick={() => save()} disabled={saving || !dirty}>
                {saving ? <><Spinner /> Saving…</> : <><Save className="size-4" aria-hidden />Save Changes</>}
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => { setDraft(citizen); setEditing(true) }}><Pencil className="size-4" aria-hidden />Edit Profile</button>
          ))
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Section navigation */}
        <aside className="space-y-4">
          <div className="card p-4">
            <ProgressBar value={completion.percent} label="Profile Completion" />
            <p className="mt-2 text-xs text-slate-500">
              {completion.missingCount === 0 ? 'Every section is complete.' : `${completion.missingCount} item${completion.missingCount > 1 ? 's' : ''} remaining`}
            </p>
          </div>
          <nav className="card overflow-x-auto p-2" aria-label="Profile sections">
            <ul className="flex gap-1 lg:flex-col">
              {PROFILE_SECTIONS.map((s, i) => {
                const st = sectionState(s.key)
                return (
                  <li key={s.key} className="shrink-0">
                    <button
                      onClick={() => setTab(s.key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap ${tab === s.key ? 'bg-brand-50 font-medium text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
                      aria-current={tab === s.key ? 'step' : undefined}
                    >
                      {onboarding && <span className="w-4 text-xs text-slate-400 tabular-nums">{i + 1}</span>}
                      <span className="flex-1">{s.title}</span>
                      {st?.state === 'complete' ? (
                        <CheckCircle2 className="size-4 text-emerald-600" aria-label="Complete" />
                      ) : (
                        <AlertTriangle className="size-4 text-amber-500" aria-label="Incomplete" />
                      )}
                    </button>
                  </li>
                )
              })}
              <li className="shrink-0">
                <Link to="/documents" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-slate-600 hover:bg-slate-50">
                  {onboarding && <span className="w-4" />}
                  <span className="flex-1">Documents</span>
                  {sectionState('documents')?.state === 'complete' ? <CheckCircle2 className="size-4 text-emerald-600" aria-label="Complete" /> : <AlertTriangle className="size-4 text-amber-500" aria-label="Incomplete" />}
                </Link>
              </li>
            </ul>
          </nav>

          {!onboarding && (
            <div className="card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="size-4 text-brand-600" aria-hidden />Profile Verification Status</h3>
              <div className="mt-3"><StatusBadge status={citizen.profile_status} /></div>
              <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between"><dt>Citizen ID</dt><dd className="font-mono">{citizen.citizen_id}</dd></div>
                <div className="flex justify-between"><dt>Created</dt><dd>{formatDate(citizen.created_at)}</dd></div>
                <div className="flex justify-between"><dt>Last updated</dt><dd>{formatDate(citizen.updated_at)}</dd></div>
              </dl>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                {citizen.profile_status === 'verified' ? <BadgeCheck className="mt-px size-3.5 shrink-0 text-emerald-600" aria-hidden /> : <Clock className="mt-px size-3.5 shrink-0" aria-hidden />}
                {citizen.profile_status === 'verified'
                  ? 'Core details verified against source departments.'
                  : 'Changes are re-verified with source departments (demo: simulated).'}
              </p>
            </div>
          )}
        </aside>

        {/* Section content */}
        <section className="card" aria-labelledby="section-title">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="section-title" className="section-title">{section.title}</h2>
              <p className="text-sm text-slate-500">{section.description}</p>
            </div>
            {editing && !onboarding && <span className="text-xs font-medium text-brand-700">Editing — changes apply to all sections</span>}
          </div>
          <div className="p-5">
            <ProfileSection section={section} citizen={view} editing={editing} errors={errors} onChange={onChange} />
          </div>
          {onboarding ? (
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-between">
              <button className="btn-secondary" onClick={() => setTab(PROFILE_SECTIONS[Math.max(0, stepIndex - 1)].key)} disabled={stepIndex === 0 || saving}>
                <ArrowLeft className="size-4" aria-hidden />Back
              </button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button className="btn-ghost" onClick={() => save(() => navigate('/dashboard'))} disabled={saving}>Save & finish later</button>
                <button className="btn-primary" onClick={nextStep} disabled={saving}>
                  {saving ? <><Spinner /> Saving…</> : stepIndex === PROFILE_SECTIONS.length - 1 ? <>Finish &amp; see my schemes <ArrowRight className="size-4" aria-hidden /></> : <>Save &amp; continue <ArrowRight className="size-4" aria-hidden /></>}
                </button>
              </div>
            </div>
          ) : editing ? (
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3 sm:hidden">
              <button className="btn-secondary flex-1" onClick={() => (dirty ? setConfirmDiscard(true) : cancel())}>Cancel</button>
              <button className="btn-primary flex-1" onClick={() => save()} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        message="Your edits to the profile will be lost."
        confirmLabel="Discard changes"
        danger
        onConfirm={cancel}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  )
}
