import { useMemo, useState } from 'react'
import { Activity, FileInput, GitCompareArrows, KeyRound, ScrollText, ShieldCheck, UserRound, FileCheck2, type LucideIcon } from 'lucide-react'
import type { AuditCategory, AuditLog } from '@/types'
import { api } from '@/api'
import { useApi } from '@/hooks/useApi'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/ui'
import { formatDate, formatTime } from '@/lib/fields'

const CAT: Record<AuditCategory, { icon: LucideIcon; label: string }> = {
  consent: { icon: ShieldCheck, label: 'Consent' },
  application: { icon: FileInput, label: 'Application' },
  api: { icon: Activity, label: 'API' },
  mapping: { icon: GitCompareArrows, label: 'Data mapping' },
  profile: { icon: UserRound, label: 'Profile' },
  auth: { icon: KeyRound, label: 'Authentication' },
  document: { icon: FileCheck2, label: 'Document' },
}

const OUTCOME = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  failure: 'bg-red-50 text-red-700',
}

export function AuditRow({ log }: { log: AuditLog }) {
  const c = CAT[log.category]
  return (
    <li className="flex gap-3 px-5 py-3">
      <div className="w-16 shrink-0 pt-0.5 text-xs text-slate-500 tabular-nums">{formatTime(log.at)}</div>
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${OUTCOME[log.outcome]}`}>
        <c.icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-900">{log.action}</div>
        <div className="truncate text-xs text-slate-500">{log.target}</div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="text-xs text-slate-600">{log.actor}</div>
        <div className={`mt-0.5 inline-block rounded px-1.5 text-[10px] font-semibold uppercase ${OUTCOME[log.outcome]}`}>{log.outcome}</div>
      </div>
    </li>
  )
}

export default function AuditLogs() {
  const logs = useApi(() => api.admin.auditLogs())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [outcome, setOutcome] = useState('all')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (logs.data ?? []).filter((l) =>
      (cat === 'all' || l.category === cat) &&
      (outcome === 'all' || l.outcome === outcome) &&
      (!term || [l.action, l.target, l.actor].some((v) => v.toLowerCase().includes(term))),
    )
  }, [logs.data, q, cat, outcome])

  // Group by day for readability.
  const groups = useMemo(() => {
    const m = new Map<string, AuditLog[]>()
    for (const l of filtered) {
      const k = formatDate(l.at)
      m.set(k, [...(m.get(k) ?? []), l])
    }
    return [...m.entries()]
  }, [filtered])

  return (
    <>
      <PageHeader title="Audit Logs" description="Immutable trail of consent, data sharing, mapping and API activity. Citizen identities are pseudonymised." />
      <FilterBar
        leading={<SearchBar value={q} onChange={setQ} placeholder="Search actions, targets, actors…" label="Search audit logs" />}
        filters={[
          { id: 'cat', label: 'Category', value: cat, onChange: setCat, options: [{ value: 'all', label: 'All categories' }, ...Object.entries(CAT).map(([k, v]) => ({ value: k, label: v.label }))] },
          { id: 'outcome', label: 'Outcome', value: outcome, onChange: setOutcome, options: [{ value: 'all', label: 'All outcomes' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'failure', label: 'Failure' }] },
        ]}
        onReset={() => { setQ(''); setCat('all'); setOutcome('all') }}
      />
      <div className="mt-6">
        {logs.error ? (
          <ErrorState message={logs.error} onRetry={logs.reload} />
        ) : logs.loading ? (
          <CardsSkeleton count={2} className="h-64" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching log entries" message="Adjust filters to see more activity." />
        ) : (
          <div className="space-y-6">
            {groups.map(([day, items]) => (
              <section key={day} className="card overflow-hidden">
                <h2 className="border-b border-slate-200 bg-slate-50 px-5 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{day} · {items.length} events</h2>
                <ul className="divide-y divide-slate-100">{items.map((l) => <AuditRow key={l.log_id} log={l} />)}</ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
