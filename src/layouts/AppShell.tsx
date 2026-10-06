import { useEffect, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, X } from 'lucide-react'
import Sidebar, { type NavItem } from '@/components/Sidebar'
import { ConfirmDialog } from '@/components/Modal'
import { MockBadge } from '@/components/ui'
import { useApp } from '@/context/AppContext'

interface Props {
  variant: 'citizen' | 'admin'
  items: NavItem[]
  footerItems: NavItem[]
  home: string
  unread?: number
  headerExtra?: ReactNode
}

/** Authenticated layout: sidebar on desktop, drawer on mobile. */
export default function AppShell({ variant, items, footerItems, home, unread = 0, headerExtra }: Props) {
  const { session, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => setDrawer(false), [location.pathname])

  const doLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (session?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sidebar = (
    <Sidebar
      items={items}
      footerItems={footerItems}
      home={home}
      variant={variant}
      onLogout={() => setConfirmLogout(true)}
      onNavigate={() => setDrawer(false)}
    />
  )

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button onClick={() => setDrawer(false)} className="absolute top-4 right-3 rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button className="-ml-1 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden sm:block"><MockBadge label="Prototype · Demo data" /></div>
          <div className="flex-1" />
          {headerExtra}
          {variant === 'citizen' && (
            <Link to="/notifications" className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">{unread}</span>
              )}
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${variant === 'admin' ? 'bg-slate-900 text-white' : 'bg-brand-100 text-brand-800'}`}>
              {initials}
            </div>
            <div className="hidden leading-tight md:block">
              <div className="text-sm font-medium text-slate-900">{session?.name}</div>
              <div className="text-xs text-slate-500">{variant === 'admin' ? 'Administrator' : session?.citizen_id}</div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out of GovConnect?"
        message="You'll need to sign in again to access your profile and applications."
        confirmLabel="Sign out"
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}
