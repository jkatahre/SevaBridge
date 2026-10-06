import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Clock, FileText, MapPin } from 'lucide-react'
import type { Recommendation, Service } from '@/types'
import StatusBadge, { Badge } from './StatusBadge'
import { CategoryIcon } from './categoryIcons'

export default function ServiceCard({ service, match, to }: { service: Service; match?: Recommendation; to: string }) {
  return (
    <article className="card flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <CategoryIcon category={service.category} className="size-5" />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {match && (match.eligible ? <Badge tone="success">Eligible · {match.score}%</Badge> : match.score >= 50 ? <Badge tone="warning">Partial · {match.score}%</Badge> : null)}
          <StatusBadge status={service.status} />
        </div>
      </div>
      <h3 className="mt-3 text-[15px] leading-snug font-semibold text-slate-900">{service.name}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" aria-hidden />{service.department}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">{service.category}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{service.short_description}</p>

      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-500">Eligibility</dt>
          <dd className="line-clamp-2 text-slate-700">{service.eligibility_summary}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-500">Documents</dt>
          <dd className="flex items-start gap-1 text-slate-700"><FileText className="mt-px size-3.5 shrink-0 text-slate-400" aria-hidden />{service.required_documents.length} required</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-500">Processing</dt>
          <dd className="flex items-center gap-1 text-slate-700"><Clock className="size-3.5 text-slate-400" aria-hidden />{service.processing_time}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-500">Region</dt>
          <dd className="flex items-center gap-1 text-slate-700"><MapPin className="size-3.5 text-slate-400" aria-hidden />{service.states.join(', ')}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <Link to={to} className="btn-secondary w-full">
          View Service <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
