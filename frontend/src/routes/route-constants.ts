export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  
  // Private
  DASHBOARD: '/dashboard',
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
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
} as const

export const SIDEBAR_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'Dashboard' },
  { path: ROUTES.PRODUCTS, label: 'Products', icon: 'Package' },
  { path: ROUTES.CATEGORIES, label: 'Categories', icon: 'Tags' },
  { path: ROUTES.BRANDS, label: 'Brands', icon: 'Badge' },
  { path: ROUTES.INVENTORY, label: 'Inventory', icon: 'Box' },
  { path: ROUTES.STOCK_MOVEMENTS, label: 'Stock Movements', icon: 'Activity' },
  { path: ROUTES.SUPPLIERS, label: 'Suppliers', icon: 'Users' },
  { path: ROUTES.LOCATIONS, label: 'Locations', icon: 'MapPin' },
  { path: ROUTES.PURCHASE_ORDERS, label: 'Purchase Orders', icon: 'FileText' },
  { path: ROUTES.GOODS_RECEIPTS, label: 'Goods Receipts', icon: 'PackageCheck' },
  { path: ROUTES.REPORTS, label: 'Reports', icon: 'BarChart3' },
  { path: ROUTES.AUDIT, label: 'Audit', icon: 'Shield' },
  { path: ROUTES.USERS, label: 'Users', icon: 'UserCog' },
]