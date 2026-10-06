import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Info, Megaphone } from 'lucide-react'
import type { Notification, NotificationType } from '@/types'
import { formatDate, timeAgo } from '@/lib/fields'

const ICONS: Record<NotificationType, { icon: typeof Info; cls: string; label: string }> = {
  success: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700', label: 'Success' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700', label: 'Action needed' },
  info: { icon: Info, cls: 'bg-sky-50 text-sky-700', label: 'Update' },
  announcement: { icon: Megaphone, cls: 'bg-brand-50 text-brand-700', label: 'Announcement' },
}

export default function NotificationCard({ n, onToggleRead, compact }: { n: Notification; onToggleRead?: () => void; compact?: boolean }) {
  const t = ICONS[n.type]
  return (
    <div className={`flex gap-3 ${compact ? 'py-3' : 'p-4'} ${!n.read && !compact ? 'bg-brand-50/40' : ''}`}>
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${t.cls}`}>
        <t.icon className="size-4" aria-label={t.label} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-sm ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
            {n.link ? <Link to={n.link} className="hover:underline">{n.title}</Link> : n.title}
          </p>
          {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <time dateTime={n.created_at} title={formatDate(n.created_at, true)}>{timeAgo(n.created_at)}</time>
          {!compact && <span className="text-slate-500">{t.label}</span>}
          {onToggleRead && (
            <button onClick={onToggleRead} className="font-medium text-brand-700 hover:underline">
              Mark as {n.read ? 'unread' : 'read'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
