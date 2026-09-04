import type { Product } from './product.types'
import type { User } from './user.types'
import type { InventoryBalance } from './inventory.types'

export interface StockMovement {
  id: string
  inventoryId: string
  productId: string
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  createdById: string
  createdAt: string
  product?: Product
  inventory?: InventoryBalance
  creator?: User
}

export interface StockMovementFilters {
  productId?: string
  type?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface StockMovementStats {
  totalMovements: number
  totalStockIn: number
  totalStockOut: number
  totalAdjustments: number
  totalDamage: number
}
