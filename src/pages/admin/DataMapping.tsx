import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Database, FlaskConical, Layers, Network } from 'lucide-react'
import type { DataMapping as Mapping, FieldPath } from '@/types'
import { api } from '@/api'
import { useApi } from '@/hooks/useApi'
import DataMappingTable, { MappingFlow } from '@/components/DataMappingTable'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import { ErrorState, MockBadge, PageHeader, Skeleton, StatCard } from '@/components/ui'
import { fieldLabel } from '@/lib/fields'

/** Synthetic test values for previewing transformations — never real citizen data. */
const SAMPLE: Partial<Record<FieldPath, string>> = {
  'personal_info.full_name': 'aarav kumar sharma',
  'personal_info.date_of_birth': '2004-07-19',
  'personal_info.gender': 'Female',
  'education.institution_name': 'Govt. College of Technology',
  'education.course': 'B.Tech',
  'education.branch': 'Electronics',
  'education.current_year': '2nd Year',
  'education.cgpa': '8.45',
  'financial_info.annual_income': '240000',
  'financial_info.income_category': 'LIG',
  'social_info.category': 'SC',
  'social_info.domicile_state': 'Madhya Pradesh',
}

export default function DataMapping() {
  const mappings = useApi(() => api.admin.mappings())
  const services = useApi(() => api.services.list())
  const integrations = useApi(() => api.admin.integrations())
  const [selected, setSelected] = useState<Mapping | null>(null)
  const [sample, setSample] = useState('')
  const [q, setQ] = useState('')
  const [target, setTarget] = useState('all')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    if (mappings.data && !selected) setSelected(mappings.data[0])
  }, [mappings.data, selected])
  useEffect(() => {
    if (selected) setSample(SAMPLE[selected.standard_field] ?? 'sample value')
  }, [selected])

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (mappings.data ?? []).filter((m) =>
      (target === 'all' || m.target_system === target) &&
      (status === 'all' || m.status === status) &&
      (!term || [m.source_field, m.standard_field, m.target_field, m.source_system, m.target_system].some((v) => v.toLowerCase().includes(term))),
    )
  }, [mappings.data, q, target, status])

  /** Standard field × department matrix built from each service's field mapping. */
  const matrix = useMemo(() => {
    if (!services.data || !integrations.data) return null
    const systems = integrations.data.filter((i) => services.data!.some((s) => s.integration_id === i.integration_id))
    const fieldSet = new Set<FieldPath>()
    const cells = new Map<string, Set<string>>()
    for (const s of services.data) {
      for (const [std, tgt] of Object.entries(s.field_mapping) as [FieldPath, string][]) {
        fieldSet.add(std)
        const k = `${std}|${s.integration_id}`
        cells.set(k, (cells.get(k) ?? new Set()).add(tgt))
      }
    }
    const order = Object.keys(SAMPLE)
    const fields = [...fieldSet].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
    return { systems, fields, cells }
  }, [services.data, integrations.data])

  const targets = [...new Set(mappings.data?.map((m) => m.target_system) ?? [])]
  const errors = mappings.data?.filter((m) => m.status === 'Validation Error').length ?? 0

  if (mappings.error) return <ErrorState message={mappings.error} onRetry={mappings.reload} />

  return (
    <>
      <PageHeader
        title="Data Mapping"
        description="How fields from different department systems are normalized into the GovConnect standard citizen schema and delivered in each target system's own format."
        actions={<MockBadge label="Demo mappings" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Mapping rules" value={mappings.data?.length ?? '–'} icon={Layers} />
        <StatCard label="Active" value={mappings.data?.filter((m) => m.status === 'Active').length ?? '–'} icon={CheckCircle2} tone="success" />
        <StatCard label="Validation errors" value={errors} icon={AlertTriangle} tone={errors ? 'danger' : 'neutral'} />
        <StatCard label="Standard fields in use" value={matrix?.fields.length ?? '–'} icon={Database} tone="neutral" />
      </div>

      {/* Visual flow of the selected mapping */}
      <section className="card mt-6 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title">Mapping pipeline</h2>
            <p className="text-sm text-slate-500">Select any rule in the table below to trace it. Values are synthetic test data.</p>
          </div>
          {selected && (
            <label className="flex items-center gap-2 text-sm">
              <FlaskConical className="size-4 text-slate-400" aria-hidden />
              <span className="shrink-0 text-slate-600">Test value</span>
              <input className="input w-full sm:w-56" value={sample} onChange={(e) => setSample(e.target.value)} aria-label="Test input value" />
            </label>
          )}
        </div>
        {selected ? <MappingFlow m={selected} sample={sample} /> : <Skeleton className="h-36" />}
        {selected?.status === 'Validation Error' && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            Target field <code>{selected.target_field}</code> rejects values over 40 characters in the Certificate System schema. Rule is paused until fixed.
          </p>
        )}
      </section>

      {/* Rules table */}
      <section className="mt-6">
        <FilterBar
          leading={<SearchBar value={q} onChange={setQ} placeholder="Search fields or systems…" label="Search mappings" />}
          filters={[
            { id: 'target', label: 'Target system', value: target, onChange: setTarget, options: [{ value: 'all', label: 'All target systems' }, ...targets.map((t) => ({ value: t, label: t }))] },
            { id: 'status', label: 'Status', value: status, onChange: setStatus, options: [{ value: 'all', label: 'All statuses' }, { value: 'Active', label: 'Active' }, { value: 'Validation Error', label: 'Validation Error' }, { value: 'Draft', label: 'Draft' }] },
          ]}
        />
        <div className="mt-3">
          {mappings.loading ? <Skeleton className="h-80" /> : <DataMappingTable rows={rows} selectedId={selected?.mapping_id} onSelect={setSelected} />}
        </div>
      </section>

      {/* Interoperability matrix */}
      <section className="mt-8">
        <h2 className="section-title flex items-center gap-2"><Network className="size-4 text-slate-400" aria-hidden />Interoperability matrix</h2>
        <p className="mt-1 mb-3 text-sm text-slate-500">One standard field, many department-specific names. Each cell shows what the field is called in that department's system.</p>
        {!matrix ? <Skeleton className="h-96" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[960px] text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left font-semibold text-slate-500 uppercase">Standard field</th>
                  {matrix.systems.map((s) => <th key={s.integration_id} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap text-slate-600">{s.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrix.fields.map((f) => (
                  <tr key={f} className="hover:bg-slate-50/60">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{fieldLabel(f)}</div>
                      <code className="text-[10px] text-brand-700">{f}</code>
                    </td>
                    {matrix.systems.map((s) => {
                      const v = matrix.cells.get(`${f}|${s.integration_id}`)
                      return (
                        <td key={s.integration_id} className="px-3 py-2">
                          {v ? [...v].map((t) => <code key={t} className="mr-1 mb-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-800">{t}</code>) : <span className="text-slate-300" aria-label="Not used">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
