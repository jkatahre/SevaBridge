import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Circle, Clock, FileEdit, Search, XCircle, type LucideIcon } from 'lucide-react'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

const TONES: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

const STATUS_MAP: Record<string, { tone: Tone; icon: LucideIcon }> = {
  // applications
  Draft: { tone: 'neutral', icon: FileEdit },
  Submitted: { tone: 'info', icon: Clock },
  'Under Review': { tone: 'brand', icon: Search },
  'Verification Required': { tone: 'warning', icon: AlertTriangle },
  Approved: { tone: 'success', icon: CheckCircle2 },
  Rejected: { tone: 'danger', icon: XCircle },
  // documents
  Verified: { tone: 'success', icon: CheckCircle2 },
  'Pending Verification': { tone: 'warning', icon: Clock },
  Expired: { tone: 'neutral', icon: Clock },
  // integrations
  Connected: { tone: 'success', icon: CheckCircle2 },
  Degraded: { tone: 'warning', icon: AlertTriangle },
  Offline: { tone: 'danger', icon: XCircle },
  // services / mappings / consent
  Open: { tone: 'success', icon: Circle },
  'Closing Soon': { tone: 'warning', icon: Clock },
  Closed: { tone: 'neutral', icon: XCircle },
  Active: { tone: 'success', icon: CheckCircle2 },
  'Validation Error': { tone: 'danger', icon: AlertTriangle },
  active: { tone: 'success', icon: CheckCircle2 },
  revoked: { tone: 'neutral', icon: XCircle },
  denied: { tone: 'danger', icon: XCircle },
  expired: { tone: 'neutral', icon: Clock },
  // profile
  verified: { tone: 'success', icon: CheckCircle2 },
  pending_verification: { tone: 'warning', icon: Clock },
  incomplete: { tone: 'neutral', icon: AlertTriangle },
}

const LABELS: Record<string, string> = {
  active: 'Active',
  revoked: 'Revoked',
  denied: 'Denied',
  expired: 'Expired',
  verified: 'Verified',
  pending_verification: 'Pending Verification',
  incomplete: 'Incomplete',
}

export function Badge({ tone = 'neutral', icon: Icon, children }: { tone?: Tone; icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONES[tone]}`}>
      {Icon && <Icon className="size-3" aria-hidden />}
      {children}
    </span>
  )
}

/** Status pill with an icon + text so state is never conveyed by color alone. */
export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { tone: 'neutral' as Tone, icon: Circle }
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {LABELS[status] ?? status}
    </Badge>
  )
}
