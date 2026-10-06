import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Recommendation } from '@/types'
import { Badge } from './StatusBadge'
import { CategoryIcon } from './categoryIcons'

function MatchRing({ score, eligible }: { score: number; eligible: boolean }) {
  const r = 22
  const c = 2 * Math.PI * r
  const stroke = eligible ? 'stroke-emerald-600' : score >= 50 ? 'stroke-amber-500' : 'stroke-slate-400'
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={`${score}% eligibility match`}>
      <svg viewBox="0 0 52 52" className="size-16 -rotate-90">
        <circle cx="26" cy="26" r={r} className="fill-none stroke-slate-100" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} className={`fill-none ${stroke}`} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-slate-900 tabular-nums">{score}%</span>
        <span className="text-[9px] font-medium tracking-wide text-slate-500 uppercase">match</span>
      </div>
    </div>
  )
}

export default function SchemeCard({ rec, compact = false }: { rec: Recommendation; compact?: boolean }) {
  const { service } = rec
  const reasons = compact ? rec.matched.slice(0, 4) : rec.matched
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CategoryIcon category={service.category} className="size-3.5" />
            {service.category}
          </div>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold text-slate-900">{service.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{service.department}</p>
          <div className="mt-2">
            {rec.eligible ? <Badge tone="success" icon={CheckCircle2}>You're eligible</Badge> : <Badge tone="warning" icon={AlertCircle}>Some criteria not met</Badge>}
          </div>
        </div>
        <MatchRing score={rec.score} eligible={rec.eligible} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="text-xs font-semibold text-slate-700">{rec.eligible ? "Why you're eligible" : 'Based on'}</div>
        <ul className="mt-2 space-y-1.5">
          {reasons.map((m) => (
            <li key={m} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Met" />
              {m}
            </li>
          ))}
          {!compact && rec.unmet.map((m) => (
            <li key={m} className="flex items-start gap-2 text-sm text-slate-500">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-label="Not met" />
              {m}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex gap-2 pt-4">
        <Link to={`/services/${service.service_id}`} className="btn-secondary flex-1">View Details</Link>
        {rec.eligible && !compact && (
          <Link to={`/services/${service.service_id}?apply=1`} className="btn-primary flex-1">Apply Now</Link>
        )}
      </div>
    </article>
  )
}
