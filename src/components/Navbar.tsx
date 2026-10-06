import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useApp } from '@/context/AppContext'

const LINKS = [
  { to: '/#why', label: 'Why GovConnect' },
  { to: '/#how', label: 'How it works' },
  { to: '/explore', label: 'Services' },
]

/** Public site navigation. */
export default function Navbar() {
  const { session } = useApp()
  const [open, setOpen] = useState(false)
  const home = session ? (session.role === 'admin' ? '/admin' : '/dashboard') : null

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {home ? (
            <Link to={home} className="btn-primary">Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
        <button className="rounded-md p-2 text-slate-600 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {home ? (
              <Link to={home} className="btn-primary col-span-2">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
