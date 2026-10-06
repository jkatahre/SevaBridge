import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import type { Citizen } from '@/types'
import type { CompletionResult } from '@/lib/profileCompletion'
import ProgressBar from './ProgressBar'
import StatusBadge from './StatusBadge'

export default function ProfileCard({ citizen, completion, showSections = true }: { citizen: Citizen; completion: CompletionResult; showSections?: boolean }) {
  const name = citizen.personal_info.full_name || 'Citizen'
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const place = [citizen.address.city, citizen.address.state].filter(Boolean).join(', ')

  return (
    <section className="card p-5" aria-label="Profile summary">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-800">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-900">{name}</div>
          <div className="font-mono text-xs text-slate-500">{citizen.citizen_id}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={citizen.profile_status} />
            {place && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><MapPin className="size-3" aria-hidden />{place}</span>}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={completion.percent} label="Profile Completion" />
      </div>

      {showSections && (
        <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
          {completion.sections.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-2">
              <span className="text-slate-600">{s.title}</span>
              {s.state === 'complete' ? (
                <CheckCircle2 className="size-4 text-emerald-600" aria-label="Complete" />
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  {s.filled}/{s.total}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {completion.percent < 100 && (
        <Link to="/profile" className="btn-secondary mt-4 w-full">Complete your profile</Link>
      )}
    </section>
  )
}
