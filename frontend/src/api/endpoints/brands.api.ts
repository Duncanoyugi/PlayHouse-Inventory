import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { Brand } from '../../types'

export const brandsApi = {
  getAll: (status?: string) => 
    apiClient.get<Brand[]>(API_ENDPOINTS.brands, { params: { status } }),

  getById: (id: string) => 
    apiClient.get<Brand>(`${API_ENDPOINTS.brands}/${id}`),

  create: (data: { name: string; status?: string }) => 
    apiClient.post<Brand>(API_ENDPOINTS.brands, data),

  update: (id: string, data: { name?: string; status?: string }) => 
    apiClient.patch<Brand>(`${API_ENDPOINTS.brands}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.brands}/${id}`),
}