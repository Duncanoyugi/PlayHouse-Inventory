import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderFilters,
  PaginatedResponse,
} from '../../types'

const base = API_ENDPOINTS.purchaseOrders

export const purchaseOrdersApi = {
  getAll: (params?: PurchaseOrderFilters) => apiClient.get<PaginatedResponse<PurchaseOrder>>(base, { params }),
  getById: (id: string) => apiClient.get<PurchaseOrder>(`${base}/${id}`),
  create: (data: CreatePurchaseOrderDto) => apiClient.post<PurchaseOrder>(base, data),
  update: (id: string, data: UpdatePurchaseOrderDto) => apiClient.patch<PurchaseOrder>(`${base}/${id}`, data),
  submit: (id: string) => apiClient.post<PurchaseOrder>(`${base}/${id}/submit`),
  approve: (id: string) => apiClient.post<PurchaseOrder>(`${base}/${id}/approve`),
  cancel: (id: string) => apiClient.post<PurchaseOrder>(`${base}/${id}/cancel`),
  delete: (id: string) => apiClient.delete<{ message: string }>(`${base}/${id}`),
}
