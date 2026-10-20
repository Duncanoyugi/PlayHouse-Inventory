import type { Product } from './product.types'
import type { Supplier } from './supplier.types'
import type { User } from './user.types'
import type { GoodsReceipt } from './goods-receipt.types'

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
  unitCost?: number | string
  totalCost?: number | string
  product?: Product
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  status: PurchaseOrderStatus
  orderDate: string
  expectedDate?: string | null
  totalAmount?: number | string
  createdById: string
  approvedById?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  supplier?: Supplier
  creator?: Pick<User, 'id' | 'fullName' | 'email'>
  approver?: Pick<User, 'id' | 'fullName' | 'email'> | null
  items?: PurchaseOrderItem[]
  goodsReceipts?: GoodsReceipt[]
  _count?: { items: number; goodsReceipts: number }
}

export interface PurchaseOrderLineInput {
  productId: string
  quantity: number
  unitCost: number
}

export interface CreatePurchaseOrderDto {
  supplierId: string
  expectedDate?: string
  items: PurchaseOrderLineInput[]
}

export type UpdatePurchaseOrderDto = Partial<CreatePurchaseOrderDto>

export interface PurchaseOrderFilters {
  supplierId?: string
  status?: PurchaseOrderStatus | ''
  search?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
