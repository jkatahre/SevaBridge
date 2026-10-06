import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarClock, CheckCircle2, ShieldCheck, ShieldOff, Target } from 'lucide-react'
import type { Consent } from '@/types'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import { fieldLabel, formatDate, groupBySection } from '@/lib/fields'
import StatusBadge from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/Modal'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader, TableWrap, td, th } from '@/components/ui'

export default function Permissions() {
  const { session, toast, refresh } = useApp()
  const id = session!.citizen_id!
  const consents = useApi(() => api.consents.list(id), [id])
  const [revoking, setRevoking] = useState<Consent | null>(null)
  const [busy, setBusy] = useState(false)

  const active = consents.data?.filter((c) => c.status === 'active') ?? []
  const history = consents.data ?? []

  const revoke = async () => {
    if (!revoking) return
    setBusy(true)
    try {
      await api.consents.revoke(revoking.consent_id)
      refresh()
      toast(`Access revoked for ${revoking.department}.`)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
      setRevoking(null)
    }
  }

  return (
    <>
      <PageHeader title="Privacy & Permissions" description="See exactly which departments can access which parts of your profile, and why. Revoke access at any time." />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, t: 'Field-level consent', d: 'Departments only receive fields you approve.' },
          { icon: CalendarClock, t: 'Time-bound access', d: 'Every permission expires automatically.' },
          { icon: ShieldOff, t: 'Revoke anytime', d: 'Stop future access with one click.' },
        ].map((x) => (
          <div key={x.t} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <x.icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <div><div className="text-sm font-semibold text-slate-900">{x.t}</div><div className="text-xs text-slate-500">{x.d}</div></div>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3">Active Permissions <span className="text-sm font-normal text-slate-500">({active.length})</span></h2>
      {consents.error ? (
        <ErrorState message={consents.error} onRetry={consents.reload} />
      ) : consents.loading ? (
        <CardsSkeleton count={2} className="h-56" />
      ) : active.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No department has access to your data" message="When you apply for a service, you'll be asked for consent first." action={<Link to="/services" className="btn-secondary">Browse services</Link>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {active.map((c) => (
            <article key={c.consent_id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Building2 className="size-5" aria-hidden /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{c.department}</h3>
                    <p className="text-xs text-slate-500">{c.service_name}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Data access</div>
              <div className="mt-2 space-y-2">
                {groupBySection(c.fields).map(({ section, fields }) => (
                  <div key={section.key} className="text-sm">
                    <span className="text-xs text-slate-500">{section.title}: </span>
                    <span className="inline-flex flex-wrap gap-1 align-middle">
                      {fields.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-800">
                          <CheckCircle2 className="size-3" aria-hidden />{fieldLabel(f)}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                <div className="col-span-2"><dt className="flex items-center gap-1 text-slate-500"><Target className="size-3" aria-hidden />Purpose</dt><dd className="mt-0.5 text-slate-800">{c.purpose}</dd></div>
                <div><dt className="text-slate-500">Granted</dt><dd className="mt-0.5 text-slate-800">{formatDate(c.granted_at)}</dd></div>
                <div><dt className="text-slate-500">Expires</dt><dd className="mt-0.5 text-slate-800">{formatDate(c.expires_at)}</dd></div>
              </dl>
              <button className="btn-danger mt-4 self-start" onClick={() => setRevoking(c)}><ShieldOff className="size-4" aria-hidden />Revoke Access</button>
            </article>
          ))}
        </div>
      )}

      <h2 className="section-title mt-10 mb-3">Permission History</h2>
      {history.length > 0 && (
        <TableWrap>
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className={th}>Service</th><th className={th}>Data shared</th><th className={th}>Purpose</th><th className={th}>Date</th><th className={th}>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((c) => (
                <tr key={c.consent_id}>
                  <td className={td}><div className="font-medium text-slate-900">{c.service_name}</div><div className="text-xs text-slate-500">{c.department}</div></td>
                  <td className="max-w-xs px-4 py-3 text-xs text-slate-600">{c.fields.length ? c.fields.map(fieldLabel).join(', ') : '— nothing shared'}</td>
                  <td className={td}>{c.purpose}</td>
                  <td className={td}>{formatDate(c.revoked_at ?? c.granted_at)}</td>
                  <td className={td}><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <ConfirmDialog
        open={!!revoking}
        danger
        busy={busy}
        title={`Revoke access for ${revoking?.department}?`}
        message={<>The department will no longer be able to read your data for "{revoking?.purpose}". Applications already submitted are not withdrawn.</>}
        confirmLabel="Revoke Access"
        onConfirm={revoke}
        onCancel={() => setRevoking(null)}
      />
    </>
  )
}
