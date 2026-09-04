import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { Category } from '../../types'

export const categoriesApi = {
  getAll: (status?: string) => 
    apiClient.get<Category[]>(API_ENDPOINTS.categories, { params: { status } }),

  getById: (id: string) => 
    apiClient.get<Category>(`${API_ENDPOINTS.categories}/${id}`),

  create: (data: { name: string; description?: string; status?: string }) => 
    apiClient.post<Category>(API_ENDPOINTS.categories, data),

  update: (id: string, data: { name?: string; description?: string; status?: string }) => 
    apiClient.patch<Category>(`${API_ENDPOINTS.categories}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.categories}/${id}`),
}