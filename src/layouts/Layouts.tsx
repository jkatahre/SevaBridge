import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Activity, Bell, Boxes, FileCheck2, FileText, GitCompareArrows, LayoutDashboard, Network, ScrollText,
  Settings, ShieldCheck, Sparkles, UserRound, Inbox,
} from 'lucide-react'
import AppShell from './AppShell'
import Navbar from '@/components/Navbar'
import Logo from '@/components/Logo'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api'
import type { Role } from '@/types'

export function RequireRole({ role }: { role: Role }) {
  const { session } = useApp()
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (session.role !== role) return <Navigate to={session.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <Outlet />
}

export function CitizenLayout() {
  const { session } = useApp()
  const id = session?.citizen_id ?? ''
  const { data: notes } = useApi(() => api.notifications.list(id), [id])
  const unread = notes?.filter((n) => !n.read).length ?? 0

  return (
    <AppShell
      variant="citizen"
      home="/dashboard"
      unread={unread}
      items={[
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Profile', icon: UserRound },
        { to: '/services', label: 'Services', icon: Boxes },
        { to: '/schemes', label: 'Recommended Schemes', icon: Sparkles },
        { to: '/applications', label: 'My Applications', icon: FileText },
        { to: '/documents', label: 'Documents', icon: FileCheck2 },
        { to: '/permissions', label: 'Permissions', icon: ShieldCheck },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: unread },
      ]}
      footerItems={[{ to: '/settings', label: 'Settings', icon: Settings }]}
    />
  )
}

export function AdminLayout() {
  return (
    <AppShell
      variant="admin"
      home="/admin"
      items={[
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/systems', label: 'Connected Systems', icon: Network },
        { to: '/admin/mapping', label: 'Data Mapping', icon: GitCompareArrows },
        { to: '/admin/monitoring', label: 'API Monitoring', icon: Activity },
        { to: '/admin/applications', label: 'Applications', icon: Inbox },
        { to: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
      ]}
      footerItems={[{ to: '/admin/settings', label: 'Settings', icon: Settings }]}
    />
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-slate-500">
              A prototype for secure interoperability between government digital platforms. All data, departments and
              integrations shown are fictional and for demonstration only.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-900">Platform</div>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>Unified Profile</li>
                <li>Consent Manager</li>
                <li>Integration Layer</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Citizens</div>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>Services</li>
                <li>Schemes</li>
                <li>Track applications</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Trust</div>
              <ul className="mt-2 space-y-1.5 text-slate-500">
                <li>Privacy by design</li>
                <li>Consent-first sharing</li>
                <li>Audit trail</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} GovConnect prototype · Not an official government website
        </div>
      </footer>
    </div>
  )
}
