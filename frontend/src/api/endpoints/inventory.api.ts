import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { 
  InventoryBalance, 
  StockInDto, 
  StockOutDto, 
  AdjustmentDto, 
  DamageDto,
  PaginatedResponse,
  LowStockItem
} from '../../types'

export const inventoryApi = {
  getAll: (params?: { locationId?: string; productId?: string; page?: number; limit?: number }) => 
    apiClient.get<PaginatedResponse<InventoryBalance>>(API_ENDPOINTS.inventory, { params }),

  getByProduct: (productId: string) => 
    apiClient.get<{ product: any; inventory: InventoryBalance[]; summary: any }>(
      `${API_ENDPOINTS.inventory}/${productId}`
    ),

  getByLocation: (locationId: string) => 
    apiClient.get<InventoryBalance[]>(`${API_ENDPOINTS.inventory}/location/${locationId}`),

  getLowStock: (locationId?: string) => 
    apiClient.get<{ lowStock: LowStockItem[]; outOfStock: LowStockItem[] }>(
      `${API_ENDPOINTS.inventory}/low-stock`,
      { params: { locationId } }
    ),

  stockIn: (data: StockInDto) => 
    apiClient.post<{ inventory: InventoryBalance; movement: any }>(
      `${API_ENDPOINTS.inventory}/stock-in`,
      data
    ),

  stockOut: (data: StockOutDto) => 
    apiClient.post<{ inventory: InventoryBalance; movement: any }>(
      `${API_ENDPOINTS.inventory}/stock-out`,
      data
    ),

  adjust: (data: AdjustmentDto) => 
    apiClient.post<{ inventory: InventoryBalance; movement: any; adjustmentNumber: string }>(
      `${API_ENDPOINTS.inventory}/adjust`,
      data
    ),

  damage: (data: DamageDto) => 
    apiClient.post<{ inventory: InventoryBalance; movement: any }>(
      `${API_ENDPOINTS.inventory}/damage`,
      data
    ),
}