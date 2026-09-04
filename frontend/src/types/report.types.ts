export interface ReportFilters {
  fromDate?: string
  toDate?: string
  categoryId?: string
  brandId?: string
  locationId?: string
}

export interface InventorySummaryReport {
  totalProducts: number
  totalInventoryValue: number
  totalQuantity: number
  lowStockItems: number
  outOfStockItems: number
}

export interface LowStockReportItem {
  product: {
    id: string
    name: string
    sku: string
    costPrice: number
    reorderLevel: number
  }
  location: {
    id: string
    name: string
  }
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  shortfall: number
}

export interface MovementReportItem {
  date: string
  type: string
  productName: string
  quantity: number
  reason: string
}

export interface ValuationReportItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitCost: number
  totalValue: number
}
