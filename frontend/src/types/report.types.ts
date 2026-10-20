import type { Product } from './product.types'
import type { Location } from './inventory.types'
import type { LowStockItem } from './inventory.types'
import type { StockMovement } from './stock-movement.types'

export interface ReportFilters {
  fromDate?: string
  toDate?: string
  productId?: string
  locationId?: string
}

export interface InventorySummaryReport {
  summary: {
    totalProducts: number
    totalUnits: number
    totalReserved: number
    totalAvailable: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
  }
  byLocation: { locationName: string; totalUnits: number; totalValue: number }[]
  byCategory: { categoryName: string; totalUnits: number; totalValue: number }[]
}

export interface LowStockReport {
  lowStock: LowStockItem[]
  outOfStock: LowStockItem[]
  summary: { totalLowStock: number; totalOutOfStock: number }
}

export interface ValuationReport {
  items: {
    product: Product
    location: Location
    quantity: number
    reservedQuantity: number
    availableQuantity: number
    costPrice: number | string
    totalValue: number
    availableValue: number
  }[]
  summary: {
    totalItems: number
    totalUnits: number
    totalAvailable: number
    totalValue: number
    totalAvailableValue: number
  }
}

export interface MovementReport {
  movements: StockMovement[]
  truncated: boolean
  summary: {
    totalMovements: number
    totalStockIn: number
    totalStockOut: number
    netChange: number
    byType: Record<string, number>
  }
}

export interface TopMovingReport {
  period: string
  results: {
    product: Product
    totalQuantity: number
    totalValue: number
    movementCount: number
    locations: string[]
  }[]
  summary: { totalProducts: number; totalUnits: number; totalValue: number }
}
