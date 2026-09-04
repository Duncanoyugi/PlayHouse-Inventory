import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'

export const reportsApi = {
  getInventorySummary: (locationId?: string) => 
    apiClient.get(`${API_ENDPOINTS.reports}/inventory-summary`, { params: { locationId } }),

  getLowStockReport: (locationId?: string) => 
    apiClient.get(`${API_ENDPOINTS.reports}/low-stock`, { params: { locationId } }),

  getMovementReport: (params?: { fromDate?: string; toDate?: string; productId?: string; locationId?: string }) => 
    apiClient.get(`${API_ENDPOINTS.reports}/movements`, { params }),

  getValuationReport: (locationId?: string) => 
    apiClient.get(`${API_ENDPOINTS.reports}/valuation`, { params: { locationId } }),

  getTopMovingProducts: (limit?: number, period?: number) => 
    apiClient.get(`${API_ENDPOINTS.reports}/top-moving`, { params: { limit, period } }),
}