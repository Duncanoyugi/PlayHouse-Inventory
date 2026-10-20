import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'danger' | 'brand'
  children: ReactNode
}

export function IconButton({ label, tone = 'default', className, children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition disabled:opacity-40',
        tone === 'default' && 'hover:bg-surface-2 hover:text-fg',
        tone === 'brand' && 'hover:bg-brand-500/10 hover:text-brand-600',
        tone === 'danger' && 'hover:bg-rose-500/10 hover:text-rose-600',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
