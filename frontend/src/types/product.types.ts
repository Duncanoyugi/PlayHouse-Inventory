import type { Status } from './common.types'
import type { Category } from './category.types'
import type { Brand } from './brand.types'

export interface Product {
  id: string
  sku: string
  externalProductId?: string
  name: string
  description?: string
  barcode?: string
  costPrice: number
  reorderLevel: number
  status: Status
  categoryId: string
  brandId: string
  createdAt: string
  updatedAt: string
  category?: Category
  brand?: Brand
  totalQuantity?: number
  reservedQuantity?: number
  availableQuantity?: number
}

export interface CreateProductDto {
  sku: string
  name: string
  description?: string
  barcode?: string
  costPrice: number
  reorderLevel: number
  categoryId: string
  brandId: string
  status?: Status
}

export interface UpdateProductDto {
  sku?: string
  name?: string
  description?: string
  barcode?: string
  costPrice?: number
  reorderLevel?: number
  categoryId?: string
  brandId?: string
  status?: Status
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  brandId?: string
  status?: Status
  page?: number
  limit?: number
}
