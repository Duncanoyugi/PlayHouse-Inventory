import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { User, PaginatedResponse, Role, UserStatus } from '../../types'

export interface UserInput {
  email: string
  fullName: string
  password?: string
  role: Role
  status?: UserStatus
}

export const usersApi = {
  getAll: (page = 1, limit = 20) => apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.users, { params: { page, limit } }),
  create: (data: UserInput & { password: string }) => apiClient.post<User>(API_ENDPOINTS.users, data),
  update: (id: string, data: Partial<UserInput>) => apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}`, data),
  disable: (id: string) => apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}/disable`),
  enable: (id: string) => apiClient.patch<User>(`${API_ENDPOINTS.users}/${id}/enable`),
}
