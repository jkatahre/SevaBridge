import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import type { NotificationType } from '@/types'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { useApi } from '@/hooks/useApi'
import NotificationCard from '@/components/NotificationCard'
import { CardsSkeleton, EmptyState, ErrorState, PageHeader } from '@/components/ui'

const TABS: { label: string; type?: NotificationType | 'unread' }[] = [
  { label: 'All' },
  { label: 'Unread', type: 'unread' },
  { label: 'Success', type: 'success' },
  { label: 'Action needed', type: 'warning' },
  { label: 'Updates', type: 'info' },
  { label: 'Announcements', type: 'announcement' },
]

export default function Notifications() {
  const { session, refresh } = useApp()
  const id = session!.citizen_id!
  const notes = useApi(() => api.notifications.list(id), [id])
  const [tab, setTab] = useState(0)

  const t = TABS[tab].type
  const list = notes.data?.filter((n) => !t || (t === 'unread' ? !n.read : n.type === t)) ?? []
  const unread = notes.data?.filter((n) => !n.read).length ?? 0

  const toggle = async (nid: string, read: boolean) => {
    notes.setData((d) => d?.map((n) => (n.notification_id === nid ? { ...n, read } : n)))
    await api.notifications.setRead(nid, read)
    refresh()
  }

  return (
    <>
      <PageHeader title="Notifications" description={unread ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : "You're all caught up."}
        actions={unread > 0 && <button className="btn-secondary" onClick={async () => { await api.notifications.markAllRead(id); refresh() }}><CheckCheck className="size-4" aria-hidden />Mark all as read</button>} />

      <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map((x, i) => (
          <button key={x.label} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${tab === i ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {x.label}
          </button>
        ))}
      </div>

      {notes.error ? (
        <ErrorState message={notes.error} onRetry={notes.reload} />
      ) : notes.loading ? (
        <CardsSkeleton count={3} className="h-20" />
      ) : list.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications here" message="New updates about your applications and schemes will appear here." />
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {list.map((n) => <NotificationCard key={n.notification_id} n={n} onToggleRead={() => toggle(n.notification_id, !n.read)} />)}
        </div>
      )}
    </>
  )
}
