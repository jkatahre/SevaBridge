import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, FileText, X } from 'lucide-react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import ApplicationCard from '@/components/ApplicationCard'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/ui'
import type { ApplicationStatus } from '@/types'

const FILTERS: { label: string; match: (s: ApplicationStatus) => boolean }[] = [
  { label: 'All', match: () => true },
  { label: 'In progress', match: (s) => ['Submitted', 'Under Review', 'Verification Required'].includes(s) },
  { label: 'Action needed', match: (s) => s === 'Verification Required' },
  { label: 'Completed', match: (s) => s === 'Approved' || s === 'Rejected' },
]

export default function Applications() {
  const { session } = useApp()
  const id = session!.citizen_id!
  const apps = useApi(() => api.applications.list(id), [id])
  const [params, setParams] = useSearchParams()
  const focus = params.get('id')
  const isNew = params.get('new') === '1'
  const [open, setOpen] = useState<string | null>(focus)
  const [filter, setFilter] = useState(0)

  useEffect(() => {
    if (focus && apps.data) {
      setOpen(focus)
      setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
  }, [focus, apps.data])

  const list = useMemo(() => apps.data?.filter((a) => FILTERS[filter].match(a.status)) ?? [], [apps.data, filter])
  const created = isNew ? apps.data?.find((a) => a.application_id === focus) : undefined

  return (
    <>
      <PageHeader title="My Applications" description="Track every application across departments in one place." actions={<Link to="/services" className="btn-primary">New application</Link>} />

      {created && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-600" aria-hidden />
          <div className="flex-1">
            <div className="font-semibold text-emerald-900">Application submitted successfully</div>
            <p className="text-sm text-emerald-800">
              <span className="font-mono">{created.application_id}</span> for {created.service_name} was delivered to {created.department}. We'll notify you at every stage.
            </p>
          </div>
          <button onClick={() => { params.delete('new'); setParams(params, { replace: true }) }} className="rounded p-1 text-emerald-700 hover:bg-emerald-100" aria-label="Dismiss">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 sm:inline-flex" role="tablist">
        {FILTERS.map((f, i) => {
          const count = apps.data?.filter((a) => f.match(a.status)).length
          return (
            <button key={f.label} role="tab" aria-selected={filter === i} onClick={() => setFilter(i)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${filter === i ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              {f.label}{count !== undefined && <span className="ml-1.5 text-xs text-slate-400 tabular-nums">{count}</span>}
            </button>
          )
        })}
      </div>

      {apps.error ? (
        <ErrorState message={apps.error} onRetry={apps.reload} />
      ) : apps.loading ? (
        <CardsSkeleton count={3} className="h-28" />
      ) : list.length === 0 ? (
        <EmptyState icon={FileText} title={apps.data?.length ? 'Nothing in this view' : 'No applications yet'}
          message={apps.data?.length ? 'Try a different filter.' : 'Find a service you are eligible for and apply using your Unified Profile.'}
          action={!apps.data?.length && <Link to="/schemes" className="btn-primary">See recommended schemes</Link>} />
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <ApplicationCard key={a.application_id} app={a} expanded={open === a.application_id} highlight={isNew && a.application_id === focus}
              onToggle={() => setOpen((o) => (o === a.application_id ? null : a.application_id))} />
          ))}
        </div>
      )}
    </>
  )
}
