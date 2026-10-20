import type { Product } from './product.types'
import type { User } from './user.types'
import type { InventoryBalance } from './inventory.types'

export type MovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN'

export interface StockMovement {
  id: string
  inventoryId: string
  productId: string
  type: MovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string | null
  createdById: string
  createdAt: string
  product?: Product
  inventory?: InventoryBalance
  creator?: Pick<User, 'id' | 'fullName' | 'email'>
}

export interface StockMovementFilters {
  productId?: string
  locationId?: string
  type?: MovementType | ''
  userId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
