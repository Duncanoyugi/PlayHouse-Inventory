import { clsx } from 'clsx'

interface TabsProps<T extends string> {
  tabs: { id: T; label: string; icon?: React.ReactNode }[]
  active: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2/70 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition',
            active === t.id ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
          )}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}
