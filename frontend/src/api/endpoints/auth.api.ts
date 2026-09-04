import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { LoginCredentials, AuthResponse, User } from '../../types'

export const authApi = {
  login: (credentials: LoginCredentials) => 
    apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials),

  logout: () => 
    apiClient.post<void>(API_ENDPOINTS.auth.logout),

  getMe: () => 
    apiClient.get<User>(API_ENDPOINTS.auth.me),

  refreshToken: (refreshToken: string) => 
    apiClient.post<{ accessToken: string }>(API_ENDPOINTS.auth.refresh, { refreshToken }),
}