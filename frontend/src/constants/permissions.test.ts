import { describe, expect, it } from 'vitest'
import { hasPermission, ROLE_PERMISSIONS, type Permission } from './permissions'

describe('role permissions', () => {
  it('lets a store keeper only record incoming/outgoing stock, receive deliveries and view orders', () => {
    expect([...ROLE_PERMISSIONS.STOREKEEPER].sort()).toEqual(['po:view', 'receipt:create', 'stock:record'])
  })

  it('denies a store keeper every management capability', () => {
    const denied: Permission[] = ['stock:adjust', 'catalog:manage', 'supplier:manage', 'po:manage', 'report:view', 'audit:view', 'user:manage', 'cost:view']
    for (const p of denied) expect(hasPermission('STOREKEEPER', p)).toBe(false)
  })

  it('gives the manager every permission the keeper has, plus the rest', () => {
    for (const p of ROLE_PERMISSIONS.STOREKEEPER) expect(hasPermission('ADMIN', p)).toBe(true)
    expect(hasPermission('ADMIN', 'user:manage')).toBe(true)
  })

  it('denies everything when signed out', () => {
    expect(hasPermission(undefined, 'stock:record')).toBe(false)
  })
})
