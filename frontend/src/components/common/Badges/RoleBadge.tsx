import React from 'react'
import { clsx } from 'clsx'

interface RoleBadgeProps {
  role: string
  className?: string
}

const roleStyles: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  STOREKEEPER: 'bg-blue-100 text-blue-800',
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  return (
    <span className={clsx('badge', roleStyles[role] || 'badge-gray', className)}>
      {role}
    </span>
  )
}