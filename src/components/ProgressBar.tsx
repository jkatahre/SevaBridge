interface Props {
  value: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md'
}

export default function ProgressBar({ value, label, showValue = true, size = 'md' }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  const color = v >= 90 ? 'bg-emerald-600' : v >= 60 ? 'bg-brand-600' : 'bg-amber-500'
  return (
    <div>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showValue && <span className="font-semibold text-slate-900 tabular-nums">{v}%</span>}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}
