import { ArrowDown, ArrowRight, Database, Layers, Server, Wand2 } from 'lucide-react'
import type { DataMapping } from '@/types'
import { fieldLabel } from '@/lib/fields'
import { TRANSFORMATION_LABELS, applyTransformation } from '@/lib/transform'
import StatusBadge from './StatusBadge'
import { TableWrap, td, th } from './ui'

export default function DataMappingTable({ rows, selectedId, onSelect }: { rows: DataMapping[]; selectedId?: string; onSelect?: (m: DataMapping) => void }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[820px]">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className={th}>Source system · field</th>
            <th className={th} aria-hidden />
            <th className={th}>Standard Field</th>
            <th className={th} aria-hidden />
            <th className={th}>Target system · field</th>
            <th className={th}>Transformation</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((m) => (
            <tr
              key={m.mapping_id}
              onClick={() => onSelect?.(m)}
              className={`cursor-pointer ${selectedId === m.mapping_id ? 'bg-brand-50/70' : 'hover:bg-slate-50'}`}
              aria-selected={selectedId === m.mapping_id}
            >
              <td className={td}>
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{m.source_field}</code>
                <div className="mt-1 text-xs text-slate-500">{m.source_system}</div>
              </td>
              <td className="px-1 text-slate-300"><ArrowRight className="size-4" aria-hidden /></td>
              <td className={td}><code className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-800">{m.standard_field}</code></td>
              <td className="px-1 text-slate-300"><ArrowRight className="size-4" aria-hidden /></td>
              <td className={td}>
                <code className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-800">{m.target_field}</code>
                <div className="mt-1 text-xs text-slate-500">{m.target_system}</div>
              </td>
              <td className={td}>{TRANSFORMATION_LABELS[m.transformation]}</td>
              <td className={td}><StatusBadge status={m.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  )
}

/** Large visual of one mapping: source → standard → target, with a live sample transform. */
export function MappingFlow({ m, sample }: { m: DataMapping; sample: string }) {
  const out = applyTransformation(m.transformation, sample, m.standard_field)
  const steps = [
    { icon: Database, kicker: 'Source system', system: m.source_system, field: m.source_field, value: sample, tone: 'slate' },
    { icon: Layers, kicker: 'GovConnect standard', system: fieldLabel(m.standard_field), field: m.standard_field, value: sample, tone: 'brand' },
    { icon: Server, kicker: 'Target system', system: m.target_system, field: m.target_field, value: out, tone: 'emerald' },
  ] as const

  const tones = {
    slate: 'border-slate-200 bg-white',
    brand: 'border-brand-300 bg-brand-50',
    emerald: 'border-emerald-200 bg-emerald-50/60',
  }

  return (
    <div className="flex flex-col items-stretch gap-1 lg:flex-row lg:items-center">
      {steps.map((s, i) => (
        <div key={i} className="contents">
          <div className={`flex-1 rounded-xl border p-4 ${tones[s.tone]}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <s.icon className="size-3.5" aria-hidden />
              {s.kicker}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{s.system}</div>
            <code className="mt-2 block font-mono text-sm font-medium text-brand-800">{s.field}</code>
            <div className="mt-2 truncate rounded-md bg-white/80 px-2 py-1 font-mono text-xs text-slate-700 ring-1 ring-slate-200" title={s.value}>
              "{s.value || '—'}"
            </div>
          </div>
          {i < 2 && (
            <div className="flex items-center justify-center gap-2 py-1 lg:w-32 lg:flex-col lg:gap-1">
              {i === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
                  <Wand2 className="size-3" aria-hidden />
                  {TRANSFORMATION_LABELS[m.transformation]}
                </span>
              )}
              {i === 0 && <span className="text-[10px] font-medium text-slate-500">Normalize</span>}
              <ArrowDown className="size-4 text-brand-500 lg:hidden" aria-hidden />
              <ArrowRight className="hidden size-5 text-brand-500 lg:block" aria-hidden />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
