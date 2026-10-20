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

export type Status = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
export type UserStatus = 'ACTIVE' | 'DISABLED'
/** ADMIN is shown as "Manager" in the UI. */
export type Role = 'ADMIN' | 'STOREKEEPER'
