import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../../types'

export const suppliersApi = {
  getAll: (status?: string) => 
    apiClient.get<Supplier[]>(API_ENDPOINTS.suppliers, { params: { status } }),

  getById: (id: string) => 
    apiClient.get<Supplier>(`${API_ENDPOINTS.suppliers}/${id}`),

  create: (data: CreateSupplierDto) => 
    apiClient.post<Supplier>(API_ENDPOINTS.suppliers, data),

  update: (id: string, data: UpdateSupplierDto) => 
    apiClient.patch<Supplier>(`${API_ENDPOINTS.suppliers}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.suppliers}/${id}`),
}