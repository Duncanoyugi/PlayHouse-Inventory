import React from 'react'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { Button } from '../common/Buttons/Button'
import type { Category, Brand } from '../../types'
import { Search, X } from 'lucide-react'

interface ProductFiltersProps {
  filters: {
    search: string
    categoryId: string
    brandId: string
    status: string
  }
  onFilterChange: (filters: any) => void
  categories: Category[]
  brands: Brand[]
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  brands,
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DISCONTINUED', label: 'Discontinued' },
  ]

  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      categoryId: '',
      brandId: '',
      status: '',
    })
  }

  const hasActiveFilters = filters.search || filters.categoryId || filters.brandId || filters.status

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <FormInput
            placeholder="Search by SKU, name, or barcode..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <FormSelect
          value={filters.categoryId}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map(c => ({ value: c.id, label: c.name })),
          ]}
        />

        <FormSelect
          value={filters.brandId}
          onChange={(e) => handleChange('brandId', e.target.value)}
          options={[
            { value: '', label: 'All Brands' },
            ...brands.map(b => ({ value: b.id, label: b.name })),
          ]}
        />

        <FormSelect
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
        />

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}