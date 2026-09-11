import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { User, PaginatedResponse } from '../../types'

export const usersApi = {
  getAll: (page?: number, limit?: number) => 
    apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.users, { params: { page, limit } }),

  getById: (id: string) => 
    apiClient.get<User>(`${API_ENDPOINTS.users}/${id}`),

  create: (data: { email: string; fullName: string; password: string; role: string; status?: string }) => 
    apiClient.post<User>(API_ENDPOINTS.users, data),

  update: (id: string, data: { email?: string; fullName?: string; password?: string; role?: string; status?: string }) => 
    apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}`, data),

  disable: (id: string) => 
    apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}/disable`),

  enable: (id: string) => 
    apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}/enable`),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.users}/${id}`),
}