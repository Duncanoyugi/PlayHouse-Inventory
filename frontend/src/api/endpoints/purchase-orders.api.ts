import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { PurchaseOrder, CreatePurchaseOrderDto, PaginatedResponse } from '../../types'

export const purchaseOrdersApi = {
  getAll: (params?: { supplierId?: string; status?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }) => 
    apiClient.get<PaginatedResponse<PurchaseOrder>>(API_ENDPOINTS.purchaseOrders, { params }),

  getById: (id: string) => 
    apiClient.get<PurchaseOrder>(`${API_ENDPOINTS.purchaseOrders}/${id}`),

  create: (data: CreatePurchaseOrderDto) => 
    apiClient.post<PurchaseOrder>(API_ENDPOINTS.purchaseOrders, data),

  submit: (id: string) => 
    apiClient.post<PurchaseOrder>(`${API_ENDPOINTS.purchaseOrders}/${id}/submit`),

  approve: (id: string) => 
    apiClient.post<PurchaseOrder>(`${API_ENDPOINTS.purchaseOrders}/${id}/approve`),

  cancel: (id: string) => 
    apiClient.post<PurchaseOrder>(`${API_ENDPOINTS.purchaseOrders}/${id}/cancel`),

  update: (id: string, data: { supplierId?: string; expectedDate?: string }) => 
    apiClient.patch<PurchaseOrder>(`${API_ENDPOINTS.purchaseOrders}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.purchaseOrders}/${id}`),
}