import type { Integration } from '@/types'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

const ICON = {
  Connected: { icon: CheckCircle2, cls: 'text-emerald-600', label: 'Healthy' },
  Degraded: { icon: AlertTriangle, cls: 'text-amber-600', label: 'Slow' },
  Offline: { icon: XCircle, cls: 'text-red-600', label: 'Failed' },
}

/** Compact one-line API health row: name, status icon + word, latency. */
export default function ApiStatusCard({ integ }: { integ: Integration }) {
  const s = ICON[integ.api_status]
  const latency = integ.response_time_ms
  const pct = latency ? Math.min(100, (latency / 600) * 100) : 100
  return (
    <div className="flex items-center gap-3 py-2.5">
      <s.icon className={`size-4 shrink-0 ${s.cls}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-slate-800">{integ.api_name}</span>
          <span className={`text-sm tabular-nums ${latency ? 'text-slate-700' : 'font-medium text-red-700'}`}>{latency ? `${latency} ms` : 'Failed'}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${integ.api_status === 'Connected' ? 'bg-emerald-500' : integ.api_status === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="w-12 text-right text-[11px] text-slate-500">{s.label}</span>
        </div>
      </div>
    </div>
  )
}
