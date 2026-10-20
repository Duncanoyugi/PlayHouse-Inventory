import type { Product } from './product.types'

export interface Location {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count?: { inventories: number; goodsReceipts: number }
}

export interface InventoryBalance {
  id: string
  productId: string
  locationId: string
  quantity: number
  reservedQuantity: number
  createdAt: string
  updatedAt: string
  product?: Product
  location?: Location
  availableQuantity: number
}

export interface InventoryFilters {
  locationId?: string
  productId?: string
  search?: string
  stockLevel?: 'all' | 'low' | 'out'
  page?: number
  limit?: number
}

export interface StockInDto {
  productId: string
  locationId: string
  quantity: number
  reason: string
  reference?: string
}

export type StockOutDto = StockInDto
export type DamageDto = StockInDto

export interface AdjustmentDto {
  productId: string
  locationId: string
  quantity: number
  type: 'INCREASE' | 'DECREASE'
  reason: string
}

export interface LowStockItem extends InventoryBalance {
  reorderLevel: number
  shortfall: number
}

export interface LowStockResponse {
  lowStock: LowStockItem[]
  outOfStock: LowStockItem[]
}

export interface StockActionResult {
  message: string
  inventory: InventoryBalance
}
