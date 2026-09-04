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
  notes?: string
  createdAt: string
  updatedAt: string
  purchaseOrder?: PurchaseOrder
  location?: Location
  receiver?: User
  items?: GoodsReceiptItem[]
}

export interface CreateGoodsReceiptDto {
  purchaseOrderId: string
  locationId: string
  notes?: string
  items: {
    productId: string
    receivedQuantity: number
    damagedQuantity: number
  }[]
}
