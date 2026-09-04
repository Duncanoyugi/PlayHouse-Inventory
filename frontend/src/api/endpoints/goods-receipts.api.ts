import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { GoodsReceipt, CreateGoodsReceiptDto, PaginatedResponse } from '../../types'

export const goodsReceiptsApi = {
  getAll: (params?: { purchaseOrderId?: string; locationId?: string; fromDate?: string; toDate?: string; page?: number; limit?: number }) => 
    apiClient.get<PaginatedResponse<GoodsReceipt>>(API_ENDPOINTS.goodsReceipts, { params }),

  getById: (id: string) => 
    apiClient.get<GoodsReceipt>(`${API_ENDPOINTS.goodsReceipts}/${id}`),

  getByPurchaseOrder: (purchaseOrderId: string) => 
    apiClient.get<GoodsReceipt[]>(`${API_ENDPOINTS.goodsReceipts}/purchase-order/${purchaseOrderId}`),

  create: (data: CreateGoodsReceiptDto) => 
    apiClient.post<{ goodsReceipt: GoodsReceipt; stockInResults: any[]; message: string }>(
      API_ENDPOINTS.goodsReceipts,
      data
    ),
}