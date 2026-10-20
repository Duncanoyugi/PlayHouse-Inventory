import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { AuditLog, AuditLogFilters, PaginatedResponse } from '../../types'

export const auditApi = {
  getAll: (params?: AuditLogFilters) => apiClient.get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.audit, { params }),
}
