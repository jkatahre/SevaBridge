import { Building2, CalendarDays, ChevronDown, ChevronUp, Send } from 'lucide-react'
import type { Application } from '@/types'
import { formatDate } from '@/lib/fields'
import StatusBadge from './StatusBadge'
import Timeline from './Timeline'

export default function ApplicationCard({ app, expanded, onToggle, highlight }: { app: Application; expanded: boolean; onToggle: () => void; highlight?: boolean }) {
  const payload = Object.entries(app.mapped_payload)
  return (
    <article id={app.application_id} className={`card overflow-hidden transition-shadow ${highlight ? 'ring-2 ring-brand-500' : ''}`}>
      <button onClick={onToggle} className="flex w-full flex-col gap-4 p-5 text-left hover:bg-slate-50/60 md:flex-row md:items-center" aria-expanded={expanded}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-brand-700">{app.application_id}</span>
            <StatusBadge status={app.status} />
            {highlight && <span className="text-xs font-medium text-emerald-700">· Just submitted</span>}
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold text-slate-900">{app.service_name}</h3>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" aria-hidden />{app.department}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden />Submitted {formatDate(app.submitted_at)}</span>
          </div>
        </div>
        <div className="w-full md:w-80">
          <Timeline app={app} orientation="horizontal" />
        </div>
        <span className="hidden text-slate-400 md:block">{expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}</span>
      </button>

      {expanded && (
        <div className="grid gap-6 border-t border-slate-200 bg-slate-50/50 p-5 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Status history</h4>
            <Timeline app={app} />
          </div>
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Send className="size-4 text-slate-400" aria-hidden />
              Data delivered to {app.department}
            </h4>
            {payload.length ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {payload.map(([k, v]) => (
                      <tr key={k}>
                        <td className="w-2/5 px-3 py-2 font-mono text-xs text-slate-500">{k}</td>
                        <td className="px-3 py-2 break-all text-slate-800">{v || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No profile data was shared with this application.</p>
            )}
            <p className="mt-2 text-xs text-slate-500">Field names are in the department's own format, mapped from your Unified Profile by GovConnect.</p>
          </div>
        </div>
      )}
    </article>
  )
}
