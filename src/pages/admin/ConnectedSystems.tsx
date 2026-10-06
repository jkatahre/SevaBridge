import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import IntegrationCard from '@/components/IntegrationCard'
import StatusBadge from '@/components/StatusBadge'
import { CardsSkeleton, ErrorState, MockBadge, PageHeader, TableWrap, td, th } from '@/components/ui'
import { timeAgo } from '@/lib/fields'
import type { HealthStatus } from '@/types'

export default function ConnectedSystems() {
  const { toast, refresh } = useApp()
  const integ = useApi(() => api.admin.integrations())
  const [checking, setChecking] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const count = (s: HealthStatus) => integ.data?.filter((i) => i.api_status === s).length ?? 0

  const check = async (id: string, name: string) => {
    setChecking(id)
    const ok = await api.admin.retryIntegration(id)
    setChecking(null)
    refresh()
    toast(ok ? `${name}: health check passed.` : `${name}: health check failed — system still unreachable.`, ok ? 'success' : 'error')
  }

  return (
    <>
      <PageHeader title="Connected Government Systems" description="Department systems integrated through the GovConnect integration layer." actions={<MockBadge />} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><span className="size-2 rounded-full bg-emerald-500" aria-hidden />{count('Connected')} Connected</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><span className="size-2 rounded-full bg-amber-500" aria-hidden />{count('Degraded')} Degraded</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200"><span className="size-2 rounded-full bg-red-500" aria-hidden />{count('Offline')} Offline</span>
        </div>
        <div className="flex-1" />
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => setView('grid')} aria-label="Card view" aria-pressed={view === 'grid'}><LayoutGrid className="size-4" /></button>
          <button className={`rounded-md p-1.5 ${view === 'table' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => setView('table')} aria-label="Table view" aria-pressed={view === 'table'}><List className="size-4" /></button>
        </div>
      </div>

      {integ.error ? (
        <ErrorState message={integ.error} onRetry={integ.reload} />
      ) : integ.loading ? (
        <CardsSkeleton count={6} className="h-72" />
      ) : view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integ.data!.map((i) => <IntegrationCard key={i.integration_id} integ={i} checking={checking === i.integration_id} onCheck={() => check(i.integration_id, i.name)} />)}
        </div>
      ) : (
        <TableWrap>
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className={th}>System</th><th className={th}>Department</th><th className={th}>API</th><th className={th}>Version</th><th className={th}>Response</th><th className={th}>Last sync</th><th className={th}>Health</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {integ.data!.map((i) => (
                <tr key={i.integration_id}>
                  <td className={`${td} font-medium text-slate-900`}>{i.name}</td>
                  <td className={td}>{i.department}</td>
                  <td className={td}>{i.api_name}</td>
                  <td className={td}><code className="text-xs">{i.version}</code></td>
                  <td className={`${td} tabular-nums`}>{i.response_time_ms ? `${i.response_time_ms} ms` : <span className="text-red-700">Failed</span>}</td>
                  <td className={td}>{timeAgo(i.last_sync)}</td>
                  <td className={td}><StatusBadge status={i.api_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <p className="mt-6 text-xs text-slate-400">
        These integrations are simulated for demonstration. Each adapter exposes the same interface, so it can be replaced with an authorised department API without changing the UI.
      </p>
    </>
  )
}
