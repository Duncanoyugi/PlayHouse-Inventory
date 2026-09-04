import React, { useState } from 'react'
import { DataTable } from '../common/Table/DataTable'
import { StatusBadge } from '../common/Badges/StatusBadge'
import { Button } from '../common/Buttons/Button'
import { Modal } from '../common/Modal/Modal'
import { ProductForm } from './ProductForm'
import type { Product, Category, Brand } from '../../types'
import { productsApi } from '../../api/endpoints/products.api'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ProductListProps {
  products: Product[]
  pagination: {
    page: number
    totalPages: number
    total: number
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  categories?: Category[]
  brands?: Brand[]
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  pagination,
  onPageChange,
  onRefresh,
  categories = [],
  brands = [],
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return
    try {
      await productsApi.delete(selectedProduct.id)
      toast.success('Product deleted successfully')
      setIsDeleteModalOpen(false)
      onRefresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleUpdate = async (data: any) => {
    if (!selectedProduct) return
    try {
      await productsApi.update(selectedProduct.id, data)
      toast.success('Product updated successfully')
      setIsEditModalOpen(false)
      onRefresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    }
  }

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      render: (item: Product) => (
        <span className="font-mono text-sm">{item.sku}</span>
      ),
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (item: Product) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          {item.barcode && (
            <div className="text-xs text-gray-500">Barcode: {item.barcode}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Product) => item.category?.name || '-',
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (item: Product) => item.brand?.name || '-',
    },
    {
      key: 'costPrice',
      header: 'Cost Price',
      render: (item: Product) => `KES ${item.costPrice.toLocaleString()}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: Product) => (
        <div>
          <div className="text-sm">
            Available: <span className="font-medium">{item.availableQuantity || 0}</span>
          </div>
          <div className="text-xs text-gray-500">
            Total: {item.totalQuantity || 0} | Reserved: {item.reservedQuantity || 0}
          </div>
        </div>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (item: Product) => item.reorderLevel,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Product) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Product) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(item)}
            className="text-blue-600 hover:text-blue-800"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        emptyMessage="No products found"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
      >
        <ProductForm
          initialData={selectedProduct || undefined}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          categories={categories}
          brands={brands}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="font-mono">{selectedProduct.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p>{selectedProduct.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p>{selectedProduct.category?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Brand</label>
                <p>{selectedProduct.brand?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cost Price</label>
                <p>KES {selectedProduct.costPrice.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reorder Level</label>
                <p>{selectedProduct.reorderLevel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Barcode</label>
                <p>{selectedProduct.barcode || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <StatusBadge status={selectedProduct.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-700">{selectedProduct.description || 'No description'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Stock Information</label>
              <div className="mt-1 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-3 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-gray-500">Total Quantity</span>
                  <p className="font-medium">{selectedProduct.totalQuantity || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Reserved</span>
                  <p className="font-medium">{selectedProduct.reservedQuantity || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Available</span>
                  <p className="font-medium text-green-600">{selectedProduct.availableQuantity || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
            {selectedProduct?.totalQuantity && selectedProduct.totalQuantity > 0 && (
              <span className="block text-sm text-red-600 mt-2">
                Warning: This product has {selectedProduct.totalQuantity} units in stock.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}