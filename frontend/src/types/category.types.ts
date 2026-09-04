import type { Status } from './common.types'

export interface Category {
  id: string
  name: string
  description?: string
  status: Status
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateCategoryDto {
  name: string
  description?: string
  status?: Status
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  status?: Status
}
