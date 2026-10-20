import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { GoodsReceipt, CreateGoodsReceiptDto, GoodsReceiptFilters, PaginatedResponse } from '../../types'

const base = API_ENDPOINTS.goodsReceipts

export const goodsReceiptsApi = {
  getAll: (params?: GoodsReceiptFilters) => apiClient.get<PaginatedResponse<GoodsReceipt>>(base, { params }),
  getById: (id: string) => apiClient.get<GoodsReceipt>(`${base}/${id}`),
  create: (data: CreateGoodsReceiptDto) =>
    apiClient.post<{ goodsReceipt: GoodsReceipt; message: string; purchaseOrderStatus: string }>(base, data),
}
