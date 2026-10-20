import type { StockMovement } from '../types'

const OUT_TYPES = new Set(['STOCK_OUT', 'DAMAGE'])

/** Signed change for display: stock out / damage are negative, an adjustment follows the actual delta. */
export const movementDelta = (m: StockMovement) =>
  m.type === 'ADJUSTMENT' ? m.newQuantity - m.previousQuantity : OUT_TYPES.has(m.type) ? -m.quantity : m.quantity
