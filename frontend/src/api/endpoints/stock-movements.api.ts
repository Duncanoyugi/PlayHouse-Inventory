import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { StockMovement, PaginatedResponse } from '../../types'

export const stockMovementsApi = {
  getAll: (params?: { productId?: string; locationId?: string; type?: string; userId?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }) => 
    apiClient.get<PaginatedResponse<StockMovement>>(API_ENDPOINTS.stockMovements, { params }),

  getById: (id: string) => 
    apiClient.get<StockMovement>(`${API_ENDPOINTS.stockMovements}/${id}`),

  getByProduct: (productId: string, page?: number, limit?: number) => 
    apiClient.get<PaginatedResponse<StockMovement>>(
      `${API_ENDPOINTS.stockMovements}/product/${productId}`,
      { params: { page, limit } }
    ),

  getByLocation: (locationId: string, page?: number, limit?: number) => 
    apiClient.get<PaginatedResponse<StockMovement>>(
      `${API_ENDPOINTS.stockMovements}/location/${locationId}`,
      { params: { page, limit } }
    ),
}