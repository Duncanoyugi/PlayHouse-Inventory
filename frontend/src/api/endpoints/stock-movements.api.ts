import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { StockMovement, StockMovementFilters, PaginatedResponse } from '../../types'

export const stockMovementsApi = {
  getAll: (params?: StockMovementFilters) =>
    apiClient.get<PaginatedResponse<StockMovement>>(API_ENDPOINTS.stockMovements, { params }),
}
