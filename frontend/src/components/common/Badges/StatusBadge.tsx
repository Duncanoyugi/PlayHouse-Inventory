import React from 'react'
import { clsx } from 'clsx'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  DISCONTINUED: 'bg-red-100 text-red-800',
  DISABLED: 'bg-red-100 text-red-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PARTIALLY_RECEIVED: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  'IN STOCK': 'bg-green-100 text-green-800',
  'LOW STOCK': 'bg-yellow-100 text-yellow-800',
  'OUT OF STOCK': 'bg-red-100 text-red-800',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <span className={clsx('badge', statusStyles[status] || 'badge-gray', className)}>
      {status.replace('_', ' ')}
    </span>
  )
}