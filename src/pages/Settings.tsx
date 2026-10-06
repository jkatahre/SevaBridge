import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, KeyRound, RotateCcw, Server } from 'lucide-react'
import { api, IS_MOCK } from '@/api'
import { useApp } from '@/context/AppContext'
import { ConfirmDialog } from '@/components/Modal'
import { MockBadge, PageHeader } from '@/components/ui'

/** Shared settings page for citizens and admins. */
export default function Settings() {
  const { session, logout, toast } = useApp()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <PageHeader title="Settings" description="Account and prototype settings." />
      <div className="max-w-3xl space-y-6">
        <section className="card p-5">
          <h2 className="section-title flex items-center gap-2"><KeyRound className="size-4 text-slate-400" aria-hidden />Account</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">Name</dt><dd className="font-medium text-slate-900">{session?.name}</dd></div>
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-medium text-slate-900">{session?.email}</dd></div>
            <div><dt className="text-xs text-slate-500">Role</dt><dd className="font-medium text-slate-900 capitalize">{session?.role}</dd></div>
            {session?.citizen_id && <div><dt className="text-xs text-slate-500">Citizen ID</dt><dd className="font-mono text-slate-900">{session.citizen_id}</dd></div>}
          </dl>
          {session?.role === 'citizen' && (
            <p className="mt-4 text-sm text-slate-500">Language and notification preferences are part of your <button className="font-medium text-brand-700 hover:underline" onClick={() => navigate('/profile')}>Unified Profile</button>.</p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="section-title flex items-center gap-2"><Server className="size-4 text-slate-400" aria-hidden />Data source</h2>
          <div className="mt-3 flex items-center gap-3">
            {IS_MOCK ? <MockBadge /> : <span className="text-sm text-emerald-700">Connected to backend</span>}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {IS_MOCK
              ? 'All data is stored in this browser and all department APIs are simulated. Set VITE_API_URL to connect a real backend.'
              : `Using ${import.meta.env.VITE_API_URL}`}
          </p>
        </section>

        <section className="card p-5">
          <h2 className="section-title flex items-center gap-2"><Database className="size-4 text-slate-400" aria-hidden />Demo data</h2>
          <p className="mt-2 text-sm text-slate-500">Reset all demo data (applications, consents, logs, registered accounts) to the original state. Useful before a fresh demo run.</p>
          <button className="btn-danger mt-4" onClick={() => setConfirmReset(true)}><RotateCcw className="size-4" aria-hidden />Reset demo data</button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmReset}
        danger
        title="Reset all demo data?"
        message="This deletes every change made in this browser and signs you out. This cannot be undone."
        confirmLabel="Reset & sign out"
        onConfirm={() => {
          api.admin.resetDemo()
          logout()
          toast('Demo data reset.', 'info')
          navigate('/login', { replace: true })
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}
