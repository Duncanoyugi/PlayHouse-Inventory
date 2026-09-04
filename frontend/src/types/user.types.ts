import type { Role, UserStatus } from './common.types'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  status: UserStatus
  createdAt: string
  updatedAt: string
}
