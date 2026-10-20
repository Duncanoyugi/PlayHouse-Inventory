export type SupplierStatus = 'ACTIVE' | 'INACTIVE'

export interface Supplier {
  id: string
  name: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  status: SupplierStatus
  createdAt: string
  updatedAt: string
  _count?: { purchaseOrders: number }
}

export interface CreateSupplierDto {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  status?: SupplierStatus
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>
