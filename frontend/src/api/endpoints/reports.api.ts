import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type {
  InventorySummaryReport,
  LowStockReport,
  MovementReport,
  ValuationReport,
  TopMovingReport,
  ReportFilters,
} from '../../types'

const base = API_ENDPOINTS.reports

export const reportsApi = {
  getInventorySummary: (locationId?: string) =>
    apiClient.get<InventorySummaryReport>(`${base}/inventory-summary`, { params: { locationId } }),
  getLowStockReport: (locationId?: string) =>
    apiClient.get<LowStockReport>(`${base}/low-stock`, { params: { locationId } }),
  getMovementReport: (params?: ReportFilters) => apiClient.get<MovementReport>(`${base}/movements`, { params }),
  getValuationReport: (locationId?: string) =>
    apiClient.get<ValuationReport>(`${base}/valuation`, { params: { locationId } }),
  getTopMovingProducts: (limit = 10, period = 30) =>
    apiClient.get<TopMovingReport>(`${base}/top-moving`, { params: { limit, period } }),
}
