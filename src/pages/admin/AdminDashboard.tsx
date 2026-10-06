import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, FileInput, GitCompareArrows, Network, ServerCog, EyeOff } from 'lucide-react'
import { api } from '@/api'
import { useApi } from '@/hooks/useApi'
import ApiStatusCard from '@/components/ApiStatusCard'
import StatusBadge from '@/components/StatusBadge'
import { MockBadge, PageHeader, Skeleton, StatCard } from '@/components/ui'
import { AuditRow } from './AuditLogs'
import { formatTime } from '@/lib/fields'

export default function AdminDashboard() {
  const stats = useApi(() => api.admin.stats())
  const integrations = useApi(() => api.admin.integrations())
  const logs = useApi(() => api.admin.auditLogs())
  const events = useApi(() => api.admin.apiEvents())
  const apps = useApi(() => api.admin.applications())
  const s = stats.data
  const nameOf = (iid: string) => integrations.data?.find((i) => i.integration_id === iid)?.api_name ?? iid

  return (
    <>
      <PageHeader title="Platform overview" description="Health of the GovConnect integration layer and activity across connected departments." actions={<MockBadge />} />

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
        Privacy by design: administrators see pseudonymous citizen references and aggregate metrics only — never names or profile values.
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {!s ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <StatCard label="Connected Systems" value={s.connectedSystems} icon={Network} to="/admin/systems" />
            <StatCard label="Active APIs" value={s.activeApis} icon={Activity} tone="success" hint={`${s.connectedSystems - s.activeApis} offline`} to="/admin/monitoring" />
            <StatCard label="API Errors (1h)" value={s.apiErrors} icon={AlertTriangle} tone={s.apiErrors ? 'danger' : 'neutral'} to="/admin/monitoring" />
            <StatCard label="Applications Today" value={s.applicationsToday} icon={FileInput} to="/admin/applications" />
            <StatCard label="Data Requests" value={s.dataRequests} icon={GitCompareArrows} tone="neutral" hint="Consent-approved today" to="/admin/audit" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card xl:col-span-1">
          <Header title="API health" to="/admin/monitoring" />
          <div className="divide-y divide-slate-100 px-5">
            {integrations.data?.map((i) => <ApiStatusCard key={i.integration_id} integ={i} />) ?? <div className="py-4"><Skeleton className="h-40" /></div>}
          </div>
        </section>

        <section className="card xl:col-span-2">
          <Header title="Recent activity" to="/admin/audit" />
          <ul className="divide-y divide-slate-100">
            {logs.data?.slice(0, 7).map((l) => <AuditRow key={l.log_id} log={l} />) ?? <li className="p-5"><Skeleton className="h-48" /></li>}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card">
          <Header title="Live integration traffic" to="/admin/monitoring" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <tbody className="divide-y divide-slate-100">
                {events.data?.slice(0, 7).map((e) => (
                  <tr key={e.request_id}>
                    <td className="px-5 py-2.5 text-xs whitespace-nowrap text-slate-500 tabular-nums">{formatTime(e.at)}</td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-slate-700">{nameOf(e.integration_id)}</td>
                    <td className="px-2 py-2.5"><code className="text-xs text-slate-500">{e.method} {e.endpoint}</code></td>
                    <td className="px-5 py-2.5 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${e.status_code < 400 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {e.status_code < 400 ? '●' : '▲'} {e.status_code} · {e.status_code < 400 ? `${e.latency_ms}ms` : 'timeout'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <Header title="Latest applications" to="/admin/applications" />
          <ul className="divide-y divide-slate-100">
            {apps.data?.slice(0, 6).map((a) => (
              <li key={a.application_id} className="flex items-center gap-3 px-5 py-2.5">
                <ServerCog className="size-4 shrink-0 text-slate-300" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-slate-800">{a.service_name}</div>
                  <div className="text-xs text-slate-500"><span className="font-mono">{a.application_id}</span> · {a.citizen_ref}</div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

function Header({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
      <h2 className="section-title">{title}</h2>
      <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">View <ArrowRight className="size-3.5" aria-hidden /></Link>
    </div>
  )
}
