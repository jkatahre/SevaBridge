import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, FlaskConical, Inbox, type LucideIcon } from 'lucide-react'

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-medium tracking-wide text-brand-600 uppercase">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  label, value, icon: Icon, hint, to, tone = 'brand',
}: { label: string; value: ReactNode; icon: LucideIcon; hint?: ReactNode; to?: string; tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    neutral: 'bg-slate-100 text-slate-600',
  }
  const body = (
    <div className="card flex h-full items-start gap-3 p-4 transition-colors group-hover:border-brand-300">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-[18px]" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
      </div>
    </div>
  )
  return to ? <Link to={to} className="group block">{body}</Link> : body
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }: { icon?: LucideIcon; title: string; message?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="size-6 text-slate-400" aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center" role="alert">
      <AlertTriangle className="size-8 text-red-500" aria-hidden />
      <h3 className="mt-2 text-sm font-semibold text-slate-900">We couldn't load this</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && <button className="btn-secondary mt-4" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
}

export function CardsSkeleton({ count = 3, className = 'h-40' }: { count?: number; className?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`card p-4 ${className}`}>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-3 h-3 w-1/2" />
          <Skeleton className="mt-6 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export function MockBadge({ label = 'Demo / Mock Integration' }: { label?: string }) {
  return (
    <span className="mock-tag" title="This is simulated data. No real government system is connected.">
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  )
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Horizontally scrollable table wrapper for mobile. */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export const th = 'px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase'
export const td = 'px-4 py-3 text-sm whitespace-nowrap text-slate-700'
