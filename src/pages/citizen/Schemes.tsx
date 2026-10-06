import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Sparkles } from 'lucide-react'
import { api } from '@/api'
import { useApi, useCitizen } from '@/hooks/useApi'
import { useRecommendations } from '@/hooks/useRecommendations'
import { activeEngine } from '@/lib/eligibility'
import { ageFrom, formatINR } from '@/lib/fields'
import SchemeCard from '@/components/SchemeCard'
import { CardsSkeleton, EmptyState, PageHeader } from '@/components/ui'

export default function Schemes() {
  const { citizen, documents, completion } = useCitizen()
  const services = useApi(() => api.services.list())
  const recs = useRecommendations(citizen, services.data, documents)
  const [showAll, setShowAll] = useState(false)

  const eligible = recs?.filter((r) => r.eligible) ?? []
  const partial = recs?.filter((r) => !r.eligible && r.score >= 50) ?? []

  const signals = citizen
    ? [
        ['Age', ageFrom(citizen.personal_info.date_of_birth)?.toString()],
        ['Education', [citizen.education.course, citizen.education.branch].filter(Boolean).join(' · ')],
        ['State', citizen.social_info.domicile_state || citizen.address.state],
        ['Income', citizen.financial_info.annual_income && formatINR(citizen.financial_info.annual_income)],
        ['Employment', citizen.employment.employment_status],
        ['Category', citizen.social_info.category],
        ['Disability', citizen.social_info.disability_status],
      ]
    : []

  return (
    <>
      <PageHeader title="Recommended Schemes" description="Schemes ranked by how well they match your Unified Citizen Profile." />

      <section className="card mb-6 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3 md:w-64">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Cpu className="size-5" aria-hidden /></div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Matching on</div>
              <div className="text-xs text-slate-500">{activeEngine.label}</div>
            </div>
          </div>
          <dl className="flex flex-1 flex-wrap gap-2">
            {signals.map(([k, v]) => (
              <div key={k} className={`rounded-md border px-2.5 py-1 text-xs ${v ? 'border-slate-200 bg-slate-50' : 'border-dashed border-amber-300 bg-amber-50'}`}>
                <dt className="inline text-slate-500">{k}: </dt>
                <dd className={`inline font-medium ${v ? 'text-slate-800' : 'text-amber-800'}`}>{v || 'missing'}</dd>
              </div>
            ))}
          </dl>
        </div>
        {completion && completion.percent < 100 && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Your profile is {completion.percent}% complete. <Link to="/profile" className="font-medium text-brand-700 hover:underline">Add missing details</Link> for more accurate matches.
          </p>
        )}
      </section>

      {!recs ? (
        <CardsSkeleton count={6} className="h-72" />
      ) : (
        <>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-600" aria-hidden />You're eligible <span className="text-sm font-normal text-slate-500">({eligible.length})</span>
          </h2>
          {eligible.length === 0 ? (
            <EmptyState icon={Sparkles} title="No full matches yet" message="Complete your education, income and social information to unlock recommendations." action={<Link to="/profile" className="btn-primary">Complete profile</Link>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {eligible.map((r) => <SchemeCard key={r.service.service_id} rec={r} />)}
            </div>
          )}

          {partial.length > 0 && (
            <>
              <div className="mt-10 mb-3 flex items-end justify-between">
                <h2 className="section-title">Partial matches <span className="text-sm font-normal text-slate-500">({partial.length})</span></h2>
                <button className="text-sm font-medium text-brand-700 hover:underline" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Hide' : 'Show'}</button>
              </div>
              {showAll && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {partial.map((r) => <SchemeCard key={r.service.service_id} rec={r} />)}
                </div>
              )}
            </>
          )}
          <p className="mt-8 text-xs text-slate-400">
            Scores are indicative and calculated by mock rule-based logic. The engine is pluggable, so an AI recommendation service can replace it without UI changes. Final eligibility is decided by the department.
          </p>
        </>
      )}
    </>
  )
}
