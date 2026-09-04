import type { Product } from './product.types'
import type { Supplier } from './supplier.types'
import type { User } from './user.types'

export type PurchaseOrderStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'PARTIALLY_RECEIVED' 
  | 'RECEIVED' 
  | 'CANCELLED'

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  quantity: number
  receivedQuantity: number
  unitCost: number
  totalCost: number
  product?: Product
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  status: PurchaseOrderStatus
  orderDate: string
  expectedDate?: string
  totalAmount: number
  createdById: string
  approvedById?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  supplier?: Supplier
  creator?: User
  approver?: User
  items?: PurchaseOrderItem[]
}

export interface CreatePurchaseOrderDto {
  supplierId: string
  expectedDate?: string
  items: {
    productId: string
    quantity: number
    unitCost: number
  }[]
}
