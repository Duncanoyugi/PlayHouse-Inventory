import type { Role } from '../types'

export const ROLES = { MANAGER: 'ADMIN', STOREKEEPER: 'STOREKEEPER' } as const

/** The database role ADMIN is presented as "Manager" everywhere in the UI. */
export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Manager',
  STOREKEEPER: 'Store Keeper',
}

export const ROLE_DESCRIPTION: Record<Role, string> = {
  ADMIN: 'Full control: catalogue, purchasing, stock corrections, reports and users.',
  STOREKEEPER: 'Records incoming and outgoing stock for the shop.',
}
