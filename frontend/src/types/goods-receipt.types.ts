import type { Product } from './product.types'
import type { PurchaseOrder } from './purchase-order.types'
import type { User } from './user.types'
import type { Location } from './inventory.types'

export interface GoodsReceiptItem {
  id: string
  goodsReceiptId: string
  productId: string
  orderedQuantity: number
  receivedQuantity: number
  acceptedQuantity: number
  damagedQuantity: number
  product?: Product
}

export interface GoodsReceipt {
  id: string
  receiptNumber: string
  purchaseOrderId: string
  locationId: string
  receivedById: string
  receivedAt: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  purchaseOrder?: PurchaseOrder
  location?: Location
  receiver?: Pick<User, 'id' | 'fullName' | 'email'>
  items?: GoodsReceiptItem[]
  _count?: { items: number }
}

export interface CreateGoodsReceiptDto {
  purchaseOrderId: string
  locationId: string
  notes?: string
  items: { productId: string; receivedQuantity: number; damagedQuantity: number }[]
}

export interface GoodsReceiptFilters {
  purchaseOrderId?: string
  locationId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
