import type { ReactNode } from 'react'

export interface FilterDef {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

/** A row of labelled select filters, plus an optional leading slot (e.g. a SearchBar). */
export default function FilterBar({ filters, leading, onReset }: { filters: FilterDef[]; leading?: ReactNode; onReset?: () => void }) {
  return (
    <div className="card flex flex-col gap-3 p-3 md:flex-row md:items-end">
      {leading && <div className="md:flex-1">{leading}</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:flex-none">
        {filters.map((f) => (
          <label key={f.id} className="block md:w-44">
            <span className="sr-only">{f.label}</span>
            <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="input" aria-label={f.label}>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ))}
        {onReset && (
          <button onClick={onReset} className="btn-ghost col-span-2 sm:col-span-1">Reset</button>
        )}
      </div>
    </div>
  )
}
