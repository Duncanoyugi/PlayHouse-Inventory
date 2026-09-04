export interface PaginationParams {
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export interface FilterParams {
  search?: string
  status?: string
  fromDate?: string
  toDate?: string
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type Role = 'ADMIN' | 'STOREKEEPER'
