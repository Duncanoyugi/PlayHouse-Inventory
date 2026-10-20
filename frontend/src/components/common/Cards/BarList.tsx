import { formatNumber } from '../../../utils/format-utils'

/** Dependency-free horizontal bar chart. */
export function BarList({ items, format = formatNumber }: { items: { label: string; value: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted">No data yet</p>
  return (
    <ul className="space-y-3.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate font-medium text-fg">{i.label}</span><span className="shrink-0 tabular-nums text-muted">{format(i.value)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${Math.max(3, (i.value / max) * 100)}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}
