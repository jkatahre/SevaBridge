import { Clock, GitBranch, Gauge, RefreshCw, Server } from 'lucide-react'
import type { Integration } from '@/types'
import { timeAgo } from '@/lib/fields'
import StatusBadge from './StatusBadge'
import { MockBadge, Spinner } from './ui'

const DOT = { Connected: 'bg-emerald-500', Degraded: 'bg-amber-500', Offline: 'bg-red-500' }

export default function IntegrationCard({ integ, onCheck, checking }: { integ: Integration; onCheck?: () => void; checking?: boolean }) {
  const errRate = integ.requests_today ? (integ.errors_today / integ.requests_today) * 100 : 0
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Server className="size-5" aria-hidden />
            <span className={`absolute -top-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white ${DOT[integ.api_status]}`} aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{integ.name}</h3>
            <p className="text-xs text-slate-500">{integ.department}</p>
          </div>
        </div>
        <StatusBadge status={integ.api_status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Metric icon={Server} label="API" value={integ.api_name} />
        <Metric icon={GitBranch} label="Version" value={integ.version} />
        <Metric icon={Gauge} label="Response time" value={integ.response_time_ms ? `${integ.response_time_ms} ms` : 'No response'} warn={!integ.response_time_ms || integ.response_time_ms > 400} />
        <Metric icon={Clock} label="Last sync" value={timeAgo(integ.last_sync)} warn={integ.api_status === 'Offline'} />
      </dl>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
        <div><div className="text-sm font-semibold text-slate-900 tabular-nums">{integ.uptime_pct}%</div><div className="text-[11px] text-slate-500">Uptime (30d)</div></div>
        <div><div className="text-sm font-semibold text-slate-900 tabular-nums">{integ.requests_today.toLocaleString('en-IN')}</div><div className="text-[11px] text-slate-500">Requests today</div></div>
        <div><div className={`text-sm font-semibold tabular-nums ${errRate > 2 ? 'text-red-700' : 'text-slate-900'}`}>{errRate.toFixed(2)}%</div><div className="text-[11px] text-slate-500">Error rate</div></div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <MockBadge />
        {onCheck && (
          <button className="btn-ghost px-2 py-1 text-xs" onClick={onCheck} disabled={checking}>
            {checking ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" aria-hidden />} Health check
          </button>
        )}
      </div>
    </article>
  )
}

function Metric({ icon: Icon, label, value, warn }: { icon: typeof Clock; label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-slate-500"><Icon className="size-3" aria-hidden />{label}</dt>
      <dd className={`mt-0.5 font-medium ${warn ? 'text-red-700' : 'text-slate-800'}`}>{value}</dd>
    </div>
  )
}
