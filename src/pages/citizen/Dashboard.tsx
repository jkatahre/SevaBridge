import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bell, FileCheck2, FileText, Sparkles, UserRoundCog, ChevronRight } from 'lucide-react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi, useCitizen } from '@/hooks/useApi'
import { useRecommendations } from '@/hooks/useRecommendations'
import ProfileCard from '@/components/ProfileCard'
import SchemeCard from '@/components/SchemeCard'
import StatusBadge from '@/components/StatusBadge'
import NotificationCard from '@/components/NotificationCard'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader, Skeleton, StatCard } from '@/components/ui'
import { formatDate } from '@/lib/fields'

export default function Dashboard() {
  const { session } = useApp()
  const id = session!.citizen_id!
  const { citizen, documents, completion, loading, error } = useCitizen()
  const services = useApi(() => api.services.list())
  const apps = useApi(() => api.applications.list(id), [id])
  const notes = useApi(() => api.notifications.list(id), [id])
  const recs = useRecommendations(citizen, services.data, documents)

  if (error) return <ErrorState message={error} />
  if (loading || !citizen || !completion) return <DashboardSkeleton />

  const firstName = citizen.personal_info.first_name || citizen.personal_info.full_name.split(' ')[0]
  const active = apps.data?.filter((a) => !['Approved', 'Rejected', 'Draft'].includes(a.status)) ?? []
  const needsAction = apps.data?.filter((a) => a.status === 'Verification Required') ?? []
  const eligible = recs?.filter((r) => r.eligible) ?? []
  const verifiedDocs = documents?.filter((d) => d.verification_status === 'Verified').length ?? 0
  const pendingDocs = documents?.filter((d) => d.verification_status === 'Pending Verification').length ?? 0
  const unread = notes.data?.filter((n) => !n.read).length ?? 0
  const newUser = completion.percent < 60

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Here's an overview of your profile, applications and the schemes that match you."
        actions={<Link to="/services" className="btn-primary">Explore services <ArrowRight className="size-4" aria-hidden /></Link>}
      />

      {newUser && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center">
          <UserRoundCog className="size-8 shrink-0 text-brand-700" aria-hidden />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">Complete your Unified Citizen Profile</div>
            <p className="text-sm text-slate-600">Your profile is {completion.percent}% complete. A complete profile unlocks scheme recommendations and pre-filled applications.</p>
          </div>
          <Link to="/profile?onboarding=1" className="btn-primary">Continue setup</Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Active Applications" value={active.length} icon={FileText} to="/applications" />
            <StatCard label="Eligible Schemes" value={recs ? eligible.length : '–'} icon={Sparkles} tone="success" to="/schemes" />
            <StatCard label="Pending Actions" value={needsAction.length} icon={AlertTriangle} tone={needsAction.length ? 'warning' : 'neutral'} to="/applications" />
            <StatCard label="Verified Documents" value={verifiedDocs} icon={FileCheck2} tone="brand" hint={pendingDocs ? `${pendingDocs} pending` : undefined} to="/documents" />
          </div>

          {needsAction.length > 0 && (
            <section className="card border-amber-200 bg-amber-50/50 p-4" aria-label="Pending actions">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertTriangle className="size-4" aria-hidden />Action needed</h2>
              <ul className="mt-2 space-y-2">
                {needsAction.map((a) => (
                  <li key={a.application_id} className="flex flex-col gap-2 rounded-lg bg-white p-3 text-sm sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <span className="font-medium text-slate-900">{a.service_name}</span>
                      <span className="ml-2 font-mono text-xs text-slate-500">{a.application_id}</span>
                      <p className="text-xs text-slate-600">{a.history[a.history.length - 1]?.note}</p>
                    </div>
                    <Link to="/documents" className="btn-secondary px-3 py-1.5 text-xs">Review documents</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="section-title">Recommended For You</h2>
                <p className="text-sm text-slate-500">Schemes matched to your profile by the eligibility engine.</p>
              </div>
              <Link to="/schemes" className="text-sm font-medium text-brand-700 hover:underline">View all</Link>
            </div>
            {!recs ? (
              <CardsSkeleton count={3} className="h-64" />
            ) : eligible.length === 0 ? (
              <EmptyState icon={Sparkles} title="No matches yet" message="Add your education, income and social details to your profile so we can match you to schemes." action={<Link to="/profile" className="btn-primary">Update profile</Link>} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {eligible.slice(0, 3).map((r) => <SchemeCard key={r.service.service_id} rec={r} compact />)}
              </div>
            )}
          </section>

          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="section-title">Recent applications</h2>
              <Link to="/applications" className="text-sm font-medium text-brand-700 hover:underline">Track all</Link>
            </div>
            {!apps.data ? (
              <div className="space-y-3 p-5"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
            ) : apps.data.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">You haven't applied for any services yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {apps.data.slice(0, 4).map((a) => (
                  <li key={a.application_id}>
                    <Link to={`/applications?id=${a.application_id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">{a.service_name}</div>
                        <div className="text-xs text-slate-500"><span className="font-mono">{a.application_id}</span> · {formatDate(a.submitted_at)}</div>
                      </div>
                      <StatusBadge status={a.status} />
                      <ChevronRight className="size-4 text-slate-300" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <ProfileCard citizen={citizen} completion={completion} />
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="flex items-center gap-2 section-title"><Bell className="size-4 text-slate-400" aria-hidden />Notifications{unread > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{unread}</span>}</h2>
              <Link to="/notifications" className="text-sm font-medium text-brand-700 hover:underline">All</Link>
            </div>
            <div className="divide-y divide-slate-100 px-5">
              {notes.data?.slice(0, 4).map((n) => <NotificationCard key={n.notification_id} n={n} compact />)}
              {notes.data?.length === 0 && <p className="py-6 text-center text-sm text-slate-500">You're all caught up.</p>}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="mt-6"><CardsSkeleton count={3} className="h-56" /></div>
    </div>
  )
}
