import { Link } from 'react-router-dom'

export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-brand-700" />
      <path d="M9 11.5 16 8l7 3.5V13H9z" fill="#fff" />
      <path d="M10.5 14.5h2v7h-2zm4.5 0h2v7h-2zm4.5 0h2v7h-2zM9 23h14v1.5H9z" fill="#fff" />
      <circle cx="16" cy="10.6" r="1.1" className="fill-saffron-500" />
    </svg>
  )
}

export default function Logo({ to = '/', subtitle = true, invert = false }: { to?: string; subtitle?: boolean; invert?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="GovConnect home">
      <LogoMark />
      <div className="leading-tight">
        <div className={`text-[15px] font-bold tracking-tight ${invert ? 'text-white' : 'text-slate-900'}`}>GovConnect</div>
        {subtitle && <div className={`text-[10px] font-medium tracking-wide ${invert ? 'text-brand-200' : 'text-slate-500'}`}>UNIFIED CITIZEN SERVICES</div>}
      </div>
    </Link>
  )
}
