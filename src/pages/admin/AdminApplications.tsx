import { useMemo, useState } from 'react'
import { EyeOff, Inbox } from 'lucide-react'
import type { ApplicationStatus } from '@/types'
import { api, type AdminApplicationRow } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import StatusBadge from '@/components/StatusBadge'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import { ConfirmDialog } from '@/components/Modal'
import { EmptyState, ErrorState, PageHeader, Skeleton, TableWrap, td, th } from '@/components/ui'
import { formatDate } from '@/lib/fields'

const STATUSES: ApplicationStatus[] = ['Submitted', 'Under Review', 'Verification Required', 'Approved', 'Rejected']

const NOTES: Partial<Record<ApplicationStatus, string>> = {
  'Under Review': 'Your application is being reviewed by the department.',
  'Verification Required': 'The department needs a document to be verified before continuing.',
  Approved: 'Congratulations — your application has been approved.',
  Rejected: 'Your application did not meet the criteria. You may re-apply after updating your profile.',
}

export default function AdminApplications() {
  const { toast, refresh } = useApp()
  const apps = useApi(() => api.admin.applications())
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [pending, setPending] = useState<{ row: AdminApplicationRow; to: ApplicationStatus } | null>(null)
  const [busy, setBusy] = useState(false)

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (apps.data ?? []).filter((a) =>
      (status === 'all' || a.status === status) &&
      (!term || [a.application_id, a.service_name, a.department, a.citizen_ref].some((v) => v.toLowerCase().includes(term))),
    )
  }, [apps.data, q, status])

  const apply = async () => {
    if (!pending) return
    setBusy(true)
    try {
      await api.admin.updateApplicationStatus(pending.row.application_id, pending.to, NOTES[pending.to])
      refresh()
      toast(`${pending.row.application_id} → ${pending.to}. The citizen has been notified.`)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  return (
    <>
      <PageHeader title="Applications" description="Applications routed through GovConnect to department systems. Simulate department decisions to demo citizen notifications." />
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
        Citizens are shown by pseudonymous reference. Application content is visible only to the receiving department.
      </div>

      <FilterBar
        leading={<SearchBar value={q} onChange={setQ} placeholder="Search by ID, service, department…" label="Search applications" />}
        filters={[{ id: 'status', label: 'Status', value: status, onChange: setStatus, options: [{ value: 'all', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))] }]}
      />

      <div className="mt-4">
        {apps.error ? (
          <ErrorState message={apps.error} onRetry={apps.reload} />
        ) : apps.loading ? (
          <Skeleton className="h-96" />
        ) : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="No applications match" message="Try a different search or status." />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[920px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><th className={th}>Application ID</th><th className={th}>Citizen ref.</th><th className={th}>Service</th><th className={th}>Department</th><th className={th}>Submitted</th><th className={th}>Fields shared</th><th className={th}>Status</th><th className={th}>Department action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => (
                  <tr key={a.application_id}>
                    <td className={td}><code className="text-xs font-semibold text-brand-700">{a.application_id}</code></td>
                    <td className={td}><code className="text-xs">{a.citizen_ref}</code></td>
                    <td className={`${td} max-w-[220px] truncate`} title={a.service_name}>{a.service_name}</td>
                    <td className={td}>{a.department}</td>
                    <td className={td}>{formatDate(a.submitted_at)}</td>
                    <td className={`${td} tabular-nums`}>{a.fields_shared}</td>
                    <td className={td}><StatusBadge status={a.status} /></td>
                    <td className={td}>
                      <select className="input py-1 text-xs" value="" aria-label={`Change status of ${a.application_id}`}
                        onChange={(e) => e.target.value && setPending({ row: a, to: e.target.value as ApplicationStatus })}>
                        <option value="">Move to…</option>
                        {STATUSES.filter((s) => s !== a.status && s !== 'Submitted').map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </div>

      <ConfirmDialog
        open={!!pending}
        busy={busy}
        danger={pending?.to === 'Rejected'}
        title={`Change status to "${pending?.to}"?`}
        message={<>Simulates the department updating <span className="font-mono">{pending?.row.application_id}</span>. The citizen will be notified.</>}
        confirmLabel="Update status"
        onConfirm={apply}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
