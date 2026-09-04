export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userName: string
  userRole: string
  changes: Record<string, { oldValue: unknown; newValue: unknown }>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditLogFilters {
  entityType?: string
  action?: string
  userId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
