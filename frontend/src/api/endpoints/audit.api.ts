import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { PaginatedResponse } from '../../types'

export interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  oldValue: any
  newValue: any
  ipAddress?: string
  createdAt: string
  user?: {
    id: string
    fullName: string
    email: string
  }
}

export const auditApi = {
  getAll: (params?: { userId?: string; entity?: string; entityId?: string; action?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }) => 
    apiClient.get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.audit, { params }),

  getByUser: (userId: string, page?: number, limit?: number) => 
    apiClient.get<PaginatedResponse<AuditLog>>(`${API_ENDPOINTS.audit}/user/${userId}`, { params: { page, limit } }),

  getByEntity: (entity: string, entityId: string, page?: number, limit?: number) => 
    apiClient.get<PaginatedResponse<AuditLog>>(`${API_ENDPOINTS.audit}/entity/${entity}/${entityId}`, { params: { page, limit } }),
}