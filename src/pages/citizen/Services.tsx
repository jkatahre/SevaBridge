import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import { evaluateService } from '@/lib/eligibility'
import { INDIAN_STATES } from '@/lib/fields'
import { SERVICE_CATEGORIES } from '@/data/services'
import ServiceCard from '@/components/ServiceCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import { CategoryIcon } from '@/components/categoryIcons'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/ui'
import type { Citizen, CitizenDocument, ServiceCategory } from '@/types'

/** Service discovery. In public mode there is no profile, so no eligibility filter. */
export default function Services({ publicMode = false }: { publicMode?: boolean }) {
  const { session } = useApp()
  const signedIn = !publicMode && session?.role === 'citizen'
  const id = session?.citizen_id ?? ''
  const services = useApi(() => api.services.list())
  const citizen = useApi<Citizen | null>(() => (signedIn ? api.citizens.get(id) : Promise.resolve(null)), [id, signedIn])
  const docs = useApi<CitizenDocument[]>(() => (signedIn ? api.documents.list(id) : Promise.resolve([])), [id, signedIn])

  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const category = params.get('category') ?? 'all'
  const [eligibility, setEligibility] = useState('all')
  const [state, setState] = useState('all')

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params)
    if (c === 'all') next.delete('category')
    else next.set('category', c)
    setParams(next, { replace: true })
  }

  const matches = useMemo(() => {
    if (!services.data || !citizen.data || !docs.data) return new Map()
    return new Map(services.data.map((s) => [s.service_id, evaluateService(citizen.data!, s, docs.data!)]))
  }, [services.data, citizen.data, docs.data])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (services.data ?? []).filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (state !== 'all' && !s.states.includes('All India') && !s.states.includes(state)) return false
      if (eligibility !== 'all' && signedIn) {
        const m = matches.get(s.service_id)
        if (eligibility === 'eligible' && !m?.eligible) return false
        if (eligibility === 'partial' && (m?.eligible || (m?.score ?? 0) < 50)) return false
      }
      if (!term) return true
      return [s.name, s.department, s.category, s.short_description].some((v) => v.toLowerCase().includes(term))
    })
  }, [services.data, q, category, state, eligibility, matches, signedIn])

  const reset = () => { setQ(''); setCategory('all'); setEligibility('all'); setState('all') }
  const base = publicMode ? '/explore' : '/services'

  return (
    <div className={publicMode ? 'mx-auto max-w-7xl px-4 py-10 sm:px-6' : ''}>
      <PageHeader
        title="Government Services"
        description={signedIn ? 'Browse services from connected departments. Eligibility is checked against your Unified Profile.' : 'Browse services from connected departments. Sign in to see which ones you are eligible for.'}
        actions={publicMode && <Link to="/register" className="btn-primary">Create profile to apply</Link>}
      />

      {/* Category chips */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>All services</Chip>
          {SERVICE_CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              <CategoryIcon category={c as ServiceCategory} className="size-3.5" />
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <FilterBar
        leading={<SearchBar value={q} onChange={setQ} placeholder="Search services, departments…" label="Search services" />}
        filters={[
          {
            id: 'category', label: 'Category', value: category, onChange: setCategory,
            options: [{ value: 'all', label: 'All categories' }, ...SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))],
          },
          ...(signedIn
            ? [{
                id: 'eligibility', label: 'Eligibility', value: eligibility, onChange: setEligibility,
                options: [{ value: 'all', label: 'Any eligibility' }, { value: 'eligible', label: 'Eligible for me' }, { value: 'partial', label: 'Partially eligible' }],
              }]
            : []),
          {
            id: 'state', label: 'State', value: state, onChange: setState,
            options: [{ value: 'all', label: 'All states' }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))],
          },
        ]}
        onReset={reset}
      />

      <div className="mt-6">
        {services.error ? (
          <ErrorState message={services.error} onRetry={services.reload} />
        ) : services.loading ? (
          <CardsSkeleton count={6} className="h-80" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No services match your filters" message="Try a different search term, or clear filters to see all services." action={<button className="btn-secondary" onClick={reset}>Clear filters</button>} />
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500" aria-live="polite">{filtered.length} service{filtered.length !== 1 && 's'}</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => (
                <ServiceCard key={s.service_id} service={s} match={signedIn ? matches.get(s.service_id) : undefined} to={publicMode ? '/login' : `${base}/${s.service_id}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
