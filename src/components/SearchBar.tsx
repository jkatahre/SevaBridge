import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search…', label = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string }) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600" aria-label="Clear search">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
