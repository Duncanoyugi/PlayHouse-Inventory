import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-secondary',
  danger: 'btn-danger',
  success: 'btn-success',
  warning: 'btn-warning',
  ghost: 'btn-ghost',
} as const

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx('btn', variants[variant], size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}
