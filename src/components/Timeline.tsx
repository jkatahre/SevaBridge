import { Check, X } from 'lucide-react'
import type { Application, ApplicationStatus } from '@/types'
import { formatDate } from '@/lib/fields'

const STAGES = ['Submitted', 'Under Review', 'Document Verification', 'Approved'] as const

/** Index of the stage an application has reached. */
function stageIndex(status: ApplicationStatus): number {
  switch (status) {
    case 'Draft': return -1
    case 'Submitted': return 0
    case 'Under Review': return 1
    case 'Verification Required': return 2
    case 'Approved': return 3
    case 'Rejected': return 3
  }
}

function eventFor(app: Application, stage: (typeof STAGES)[number]) {
  const match: Record<string, ApplicationStatus[]> = {
    Submitted: ['Submitted'],
    'Under Review': ['Under Review'],
    'Document Verification': ['Verification Required'],
    Approved: ['Approved', 'Rejected'],
  }
  return [...app.history].reverse().find((h) => match[stage].includes(h.status))
}

export default function Timeline({ app, orientation = 'vertical' }: { app: Application; orientation?: 'vertical' | 'horizontal' }) {
  const reached = stageIndex(app.status)
  const rejected = app.status === 'Rejected'
  const finished = app.status === 'Approved' || rejected

  const nodes = STAGES.map((stage, i) => {
    const label = i === 3 && rejected ? 'Rejected' : stage
    const done = i < reached || (i === reached && finished)
    const current = i === reached && !finished
    const ev = eventFor(app, stage)
    return { label, done, current, ev, failed: i === 3 && rejected }
  })

  if (orientation === 'horizontal') {
    return (
      <ol className="flex items-start" aria-label="Application progress">
        {nodes.map((n, i) => (
          <li key={n.label} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <div className={`absolute top-3 right-1/2 h-0.5 w-full ${n.done || n.current ? 'bg-brand-600' : 'bg-slate-200'}`} aria-hidden />}
            <Dot {...n} />
            <div className={`mt-2 px-1 text-[11px] leading-tight font-medium ${n.current ? 'text-brand-700' : n.done ? 'text-slate-700' : 'text-slate-400'}`}>{n.label}</div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ol className="relative" aria-label="Application progress">
      {nodes.map((n, i) => (
        <li key={n.label} className="relative flex gap-3 pb-6 last:pb-0">
          {i < nodes.length - 1 && (
            <div className={`absolute top-6 left-3 h-[calc(100%-1.5rem)] w-0.5 -translate-x-1/2 ${nodes[i + 1].done || nodes[i + 1].current ? 'bg-brand-600' : 'bg-slate-200'}`} aria-hidden />
          )}
          <Dot {...n} />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className={`text-sm font-medium ${n.failed ? 'text-red-700' : n.current ? 'text-brand-700' : n.done ? 'text-slate-900' : 'text-slate-400'}`}>
              {n.label}
              {n.current && <span className="ml-2 text-xs font-normal text-slate-500">· In progress</span>}
            </div>
            {n.ev && <div className="text-xs text-slate-500">{formatDate(n.ev.at, true)}</div>}
            {n.ev?.note && <div className="mt-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">{n.ev.note}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Dot({ done, current, failed }: { done: boolean; current: boolean; failed: boolean }) {
  if (failed) {
    return <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"><X className="size-3.5" aria-label="Rejected" /></span>
  }
  if (done) {
    return <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"><Check className="size-3.5" aria-label="Completed" /></span>
  }
  if (current) {
    return (
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-600 bg-white" aria-label="Current step">
        <span className="size-2.5 rounded-full bg-brand-600" />
      </span>
    )
  }
  return <span className="relative z-10 size-6 shrink-0 rounded-full border-2 border-slate-200 bg-white" aria-label="Not started" />
}
