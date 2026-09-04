import { apiClient } from '../client'
import { API_ENDPOINTS } from '../../config/api.config'
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters, PaginatedResponse } from '../../types'

export const productsApi = {
  getAll: (filters?: ProductFilters) => 
    apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.products, { params: filters }),

  getById: (id: string) => 
    apiClient.get<Product>(`${API_ENDPOINTS.products}/${id}`),

  getBySku: (sku: string) => 
    apiClient.get<Product>(`${API_ENDPOINTS.products}/sku/${sku}`),

  create: (data: CreateProductDto) => 
    apiClient.post<Product>(API_ENDPOINTS.products, data),

  update: (id: string, data: UpdateProductDto) => 
    apiClient.patch<Product>(`${API_ENDPOINTS.products}/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`${API_ENDPOINTS.products}/${id}`),
}