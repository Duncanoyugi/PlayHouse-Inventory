export const ROLES_KEY = 'roles';
export const PUBLIC_KEY = 'isPublic';

export const ROLE = {
  ADMIN: 'ADMIN',
  STOREKEEPER: 'STOREKEEPER',
} as const;

export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_VIEW: 'USER_VIEW',

  // Product Management
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PRODUCT_VIEW: 'PRODUCT_VIEW',

  // Inventory Management
  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_ADJUST: 'INVENTORY_ADJUST',
  INVENTORY_TRANSFER: 'INVENTORY_TRANSFER',

  // Purchase Orders
  PO_CREATE: 'PO_CREATE',
  PO_APPROVE: 'PO_APPROVE',
  PO_RECEIVE: 'PO_RECEIVE',

  // Supplier Management
  SUPPLIER_CREATE: 'SUPPLIER_CREATE',
  SUPPLIER_UPDATE: 'SUPPLIER_UPDATE',

  // Reports
  REPORT_VIEW: 'REPORT_VIEW',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  DUPLICATE_SKU: 'Product with this SKU already exists',
  DUPLICATE_EMAIL: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_PO_STATUS: 'Invalid purchase order status transition',
  PO_NOT_APPROVED: 'Purchase order must be approved before receiving',
  RECEIPT_EXCEEDS_ORDER: 'Received quantity exceeds ordered quantity',
  NEGATIVE_STOCK: 'Stock cannot be negative',
} as const;