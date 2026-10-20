import type { Permission } from '../constants/permissions'

export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',

  // Private
  DASHBOARD: '/dashboard',
  STOCK_DESK: '/stock-desk',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  INVENTORY: '/inventory',
  STOCK_MOVEMENTS: '/stock-movements',
  SUPPLIERS: '/suppliers',
  LOCATIONS: '/locations',
  PURCHASE_ORDERS: '/purchase-orders',
  GOODS_RECEIPTS: '/goods-receipts',
  REPORTS: '/reports',
  AUDIT: '/audit',
  USERS: '/users',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
} as const

export type NavIcon =
  | 'dashboard' | 'desk' | 'package' | 'tags' | 'badge' | 'box' | 'history' | 'truck'
  | 'pin' | 'cart' | 'receipt' | 'chart' | 'shield' | 'users'

export interface NavItem {
  path: string
  label: string
  icon: NavIcon
  /** Omitted = every signed-in user. */
  permission?: Permission
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    title: 'Store',
    items: [
      { path: ROUTES.STOCK_DESK, label: 'Stock In / Out', icon: 'desk', permission: 'stock:record' },
      { path: ROUTES.INVENTORY, label: 'Inventory', icon: 'box' },
      { path: ROUTES.STOCK_MOVEMENTS, label: 'Movements', icon: 'history' },
      { path: ROUTES.GOODS_RECEIPTS, label: 'Goods Receiving', icon: 'receipt', permission: 'receipt:create' },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { path: ROUTES.PRODUCTS, label: 'Products', icon: 'package' },
      { path: ROUTES.CATEGORIES, label: 'Categories', icon: 'tags', permission: 'catalog:manage' },
      { path: ROUTES.BRANDS, label: 'Brands', icon: 'badge', permission: 'catalog:manage' },
      { path: ROUTES.LOCATIONS, label: 'Locations', icon: 'pin', permission: 'catalog:manage' },
    ],
  },
  {
    title: 'Purchasing',
    items: [
      { path: ROUTES.PURCHASE_ORDERS, label: 'Purchase Orders', icon: 'cart', permission: 'po:view' },
      { path: ROUTES.SUPPLIERS, label: 'Suppliers', icon: 'truck', permission: 'supplier:manage' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { path: ROUTES.REPORTS, label: 'Reports', icon: 'chart', permission: 'report:view' },
      { path: ROUTES.AUDIT, label: 'Audit Log', icon: 'shield', permission: 'audit:view' },
      { path: ROUTES.USERS, label: 'Users', icon: 'users', permission: 'user:manage' },
    ],
  },
]
