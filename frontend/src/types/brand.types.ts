import type { Status } from './common.types'

export interface Brand {
  id: string
  name: string
  status: Status
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateBrandDto {
  name: string
  status?: Status
}

export interface UpdateBrandDto {
  name?: string
  status?: Status
}
