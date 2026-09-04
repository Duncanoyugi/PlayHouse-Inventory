import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/endpoints/products.api'
import { categoriesApi } from '../api/endpoints/categories.api'
import { brandsApi } from '../api/endpoints/brands.api'
import { ProductList } from '../components/products/ProductList'
import { ProductFilters } from '../components/products/ProductFilters'
import { ProductForm } from '../components/products/ProductForm'
import { Button } from '../components/common/Buttons/Button'
import { Modal } from '../components/common/Modal/Modal'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'
import toast from 'react-hot-toast'

export const ProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    status: '',
    page: 1,
  })

  const { data: productsData, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters as any),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll('ACTIVE'),
  })

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getAll('ACTIVE'),
  })

  const handleCreateProduct = async (data: any) => {
    try {
      await productsApi.create(data)
      toast.success('Product created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product')
    }
  }

  if (productsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Catalog</p>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">Add Product</Button>
      </div>

      <ProductFilters
        filters={filters as any}
        onFilterChange={setFilters}
        categories={categoriesData || []}
        brands={brandsData || []}
      />

      <ProductList
        products={productsData?.items || []}
        pagination={{
          page: productsData?.page || 1,
          totalPages: productsData?.totalPages || 1,
          total: productsData?.total || 0,
        }}
        onPageChange={(page: number) => setFilters({ ...filters, page })}
        onRefresh={refetch}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setIsModalOpen(false)}
          categories={categoriesData || []}
          brands={brandsData || []}
        />
      </Modal>
    </div>
  )
}