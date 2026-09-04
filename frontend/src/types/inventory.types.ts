import type { Product } from './product.types'

export interface Location {
  id: string
  name: string
  createdAt: string
  updatedAt: string
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
  availableQuantity?: number
}

export interface StockInDto {
  productId: string
  locationId: string
  quantity: number
  reason: string
  reference?: string
}

export interface StockOutDto {
  productId: string
  locationId: string
  quantity: number
  reason: string
  reference?: string
}

export interface AdjustmentDto {
  productId: string
  locationId: string
  quantity: number
  type: 'INCREASE' | 'DECREASE'
  reason: string
}

export interface DamageDto {
  productId: string
  locationId: string
  quantity: number
  reason: string
  reference?: string
}

export interface LowStockItem {
  product: Product
  location: Location
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderLevel: number
  shortfall: number
}
