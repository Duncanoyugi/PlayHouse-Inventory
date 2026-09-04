import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { Location } from '../../types'

export const locationsApi = {
  getAll: () => 
    apiClient.get<Location[]>(API_ENDPOINTS.locations),

  getById: (id: string) => 
    apiClient.get<Location>(`${API_ENDPOINTS.locations}/${id}`),

  create: (data: { name: string }) => 
    apiClient.post<Location>(API_ENDPOINTS.locations, data),

  update: (id: string, data: { name: string }) => 
    apiClient.patch<Location>(`${API_ENDPOINTS.locations}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.locations}/${id}`),
}