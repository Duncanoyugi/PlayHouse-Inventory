import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type {
  InventoryBalance,
  InventoryFilters,
  StockInDto,
  StockOutDto,
  AdjustmentDto,
  DamageDto,
  PaginatedResponse,
  LowStockResponse,
  StockActionResult,
} from '../../types'

const base = API_ENDPOINTS.inventory

export const inventoryApi = {
  getAll: (params?: InventoryFilters) => apiClient.get<PaginatedResponse<InventoryBalance>>(base, { params }),

  getLowStock: (locationId?: string) =>
    apiClient.get<LowStockResponse>(`${base}/low-stock`, { params: { locationId } }),

  stockIn: (data: StockInDto) => apiClient.post<StockActionResult>(`${base}/stock-in`, data),
  stockOut: (data: StockOutDto) => apiClient.post<StockActionResult>(`${base}/stock-out`, data),
  adjust: (data: AdjustmentDto) => apiClient.post<StockActionResult>(`${base}/adjust`, data),
  damage: (data: DamageDto) => apiClient.post<StockActionResult>(`${base}/damage`, data),
}
