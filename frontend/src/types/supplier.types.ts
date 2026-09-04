import type { Status } from './common.types'

export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  status: Status
  createdAt: string
  updatedAt: string
  _count?: {
    purchaseOrders: number
  }
}

export interface CreateSupplierDto {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  status?: Status
}

export interface UpdateSupplierDto {
  name?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  status?: Status
}