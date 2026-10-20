export const ROLES_KEY = 'roles';
export const PUBLIC_KEY = 'isPublic';

/**
 * ADMIN is the "Manager" in the business domain: full control of the system.
 * STOREKEEPER is limited to recording the shop's incoming and outgoing stock.
 */
export const ROLE = {
  ADMIN: 'ADMIN',
  STOREKEEPER: 'STOREKEEPER',
} as const;

export type RoleName = (typeof ROLE)[keyof typeof ROLE];

/** Roles allowed to read operational data (catalogue, stock levels, movements). */
export const ALL_ROLES: RoleName[] = [ROLE.ADMIN, ROLE.STOREKEEPER];

export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

/** Pagination limits applied to every list endpoint. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Response keys that expose purchasing cost / stock valuation. They are stripped
 * from responses for the STOREKEEPER role (least privilege).
 */
export const COST_SENSITIVE_KEYS = [
  'costPrice',
  'unitCost',
  'totalCost',
  'totalAmount',
  'totalValue',
  'availableValue',
  'averageMovementValue',
] as const;

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
