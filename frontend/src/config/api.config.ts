export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  users: '/users',
  products: '/products',
  categories: '/categories',
  brands: '/brands',
  inventory: '/inventory',
  stockMovements: '/stock-movements',
  suppliers: '/suppliers',
  purchaseOrders: '/purchase-orders',
  goodsReceipts: '/goods-receipts',
  reports: '/reports',
  audit: '/audit',
  locations: '/locations',
}