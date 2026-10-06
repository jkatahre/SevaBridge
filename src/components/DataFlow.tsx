import { ArrowDown, ArrowRight, Building2, CheckCircle2, Layers, UserRound, type LucideIcon } from 'lucide-react'
import { Spinner } from './ui'

interface Props {
  /** 0 = idle, 1 = reading profile, 2 = mapping, 3 = delivered */
  stage: number
  sharedCount: number
  withheldCount: number
  department: string
}

const NODES: { icon: LucideIcon; title: string; sub: (p: Props) => string }[] = [
  { icon: UserRound, title: 'Your Profile', sub: (p) => `${p.sharedCount} approved fields` },
  { icon: Layers, title: 'GovConnect Integration Layer', sub: () => 'Verifies & standardizes' },
  { icon: Building2, title: '', sub: () => 'Receives mapped data' },
]

const EDGES = ['Approved data', 'Standardized data']

/** Visualizes consented data moving profile → integration layer → department. */
export default function DataFlow(props: Props) {
  const { stage, withheldCount, department } = props

  const nodeState = (i: number) => (stage > i + 1 || stage === 3 ? 'done' : stage === i + 1 ? 'active' : 'idle')
  const edgeActive = (i: number) => stage >= i + 2

  return (
    <div>
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {NODES.map((n, i) => {
          const s = nodeState(i)
          return (
            <div key={i} className="contents">
              <div
                className={`flex flex-1 items-center gap-3 rounded-xl border p-4 transition-colors ${
                  s === 'done' ? 'border-emerald-200 bg-emerald-50/60' : s === 'active' ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${i === 1 ? 'bg-brand-700 text-white' : 'bg-white text-brand-700 ring-1 ring-slate-200'}`}>
                  <n.icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900">{i === 2 ? department : n.title}</div>
                  <div className="text-xs text-slate-500">{n.sub(props)}</div>
                </div>
                {s === 'done' && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-label="Done" />}
                {s === 'active' && <Spinner className="size-5 shrink-0 text-brand-600" />}
              </div>
              {i < EDGES.length && (
                <div className="flex shrink-0 items-center justify-center gap-2 py-1 md:w-28 md:flex-col md:gap-1 md:py-0">
                  <span className={`text-[11px] font-medium ${edgeActive(i) ? 'text-brand-700' : 'text-slate-400'}`}>{EDGES[i]}</span>
                  <ArrowDown className={`size-4 md:hidden ${edgeActive(i) ? 'text-brand-600' : 'text-slate-300'}`} aria-hidden />
                  <ArrowRight className={`hidden size-5 md:block ${edgeActive(i) ? 'text-brand-600' : 'text-slate-300'}`} aria-hidden />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {withheldCount > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          {withheldCount} field{withheldCount > 1 ? 's were' : ' was'} withheld and never left your profile.
        </p>
      )}
    </div>
  )
}
