import type { Role } from '../types'

/**
 * Mirrors the server-side role matrix. The UI uses it to hide what a user cannot do;
 * the API enforces the same rules, so this is convenience, not security.
 */
export type Permission =
  | 'stock:record' // stock in / stock out
  | 'receipt:create' // receive a delivery against a purchase order
  | 'stock:adjust' // count corrections and damage write-offs
  | 'catalog:manage' // products, categories, brands, locations
  | 'supplier:manage'
  | 'po:view'
  | 'po:manage'
  | 'report:view'
  | 'audit:view'
  | 'user:manage'
  | 'cost:view'

const MANAGER: Permission[] = [
  'stock:record', 'receipt:create', 'stock:adjust', 'catalog:manage', 'supplier:manage',
  'po:view', 'po:manage', 'report:view', 'audit:view', 'user:manage', 'cost:view',
]
const STOREKEEPER: Permission[] = ['stock:record', 'receipt:create', 'po:view']

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: MANAGER,
  STOREKEEPER,
}

export const hasPermission = (role: Role | undefined | null, permission: Permission) =>
  !!role && ROLE_PERMISSIONS[role].includes(permission)
