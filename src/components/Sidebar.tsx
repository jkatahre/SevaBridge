import { NavLink } from 'react-router-dom'
import { LogOut, ShieldCheck, type LucideIcon } from 'lucide-react'
import Logo from './Logo'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
  end?: boolean
}

interface Props {
  items: NavItem[]
  footerItems: NavItem[]
  onLogout: () => void
  onNavigate?: () => void
  home: string
  variant: 'citizen' | 'admin'
}

export default function Sidebar({ items, footerItems, onLogout, onNavigate, home, variant }: Props) {
  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`

  const render = (item: NavItem) => (
    <NavLink key={item.to} to={item.to} end={item.end} className={link} onClick={onNavigate}>
      <item.icon className="size-[18px] shrink-0" aria-hidden />
      <span className="flex-1">{item.label}</span>
      {!!item.badge && (
        <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">{item.badge}</span>
      )}
    </NavLink>
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4">
        <Logo to={home} />
      </div>
      {variant === 'admin' && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">
          <ShieldCheck className="size-4 text-emerald-400" aria-hidden />
          Administrator Console
        </div>
      )}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Primary">
        {items.map(render)}
      </nav>
      <div className="space-y-0.5 border-t border-slate-200 p-3">
        {footerItems.map(render)}
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="size-[18px]" aria-hidden />
          Logout
        </button>
      </div>
    </div>
  )
}
