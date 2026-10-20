export interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string | null
  createdAt: string
  user?: { id: string; fullName: string; email: string }
}

export interface AuditLogFilters {
  entity?: string
  action?: string
  userId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
