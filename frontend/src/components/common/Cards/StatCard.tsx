import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  tone?: 'brand' | 'green' | 'amber' | 'red' | 'violet'
  onClick?: () => void
  isLoading?: boolean
}

const tones = {
  brand: 'bg-brand-500/12 text-brand-600 dark:text-brand-300',
  green: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
  amber: 'bg-amber-500/14 text-amber-600 dark:text-amber-300',
  red: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
  violet: 'bg-violet-500/12 text-violet-600 dark:text-violet-300',
}

export function StatCard({ label, value, icon, hint, tone = 'brand', onClick, isLoading }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={clsx('card card-pad text-left', onClick && 'transition hover:-translate-y-0.5 hover:border-brand-500/40')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          {isLoading ? <div className="skeleton mt-2 h-8 w-28" /> : <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-fg sm:text-[26px]">{value}</p>}
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {icon && <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>{icon}</span>}
      </div>
    </Tag>
  )
}
