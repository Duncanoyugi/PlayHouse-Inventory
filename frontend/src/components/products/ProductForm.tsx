import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { FormTextarea } from '../common/Forms/FormTextarea'
import { Button } from '../common/Buttons/Button'
import type { Category, Brand, Product } from '../../types'

const productSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50, 'SKU cannot exceed 50 characters'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  barcode: z.string().max(50, 'Barcode cannot exceed 50 characters').optional(),
  costPrice: z.number().min(0, 'Cost price must be at least 0'),
  reorderLevel: z.number().min(0, 'Reorder level must be at least 0'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  categories: Category[]
  brands: Brand[]
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  categories,
  brands,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      sku: initialData.sku,
      name: initialData.name,
      description: initialData.description || '',
      barcode: initialData.barcode || '',
      costPrice: initialData.costPrice,
      reorderLevel: initialData.reorderLevel,
      categoryId: initialData.categoryId,
      brandId: initialData.brandId,
      status: initialData.status,
    } : {
      sku: '',
      name: '',
      description: '',
      barcode: '',
      costPrice: 0,
      reorderLevel: 0,
      categoryId: '',
      brandId: '',
      status: 'ACTIVE',
    },
  })

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DISCONTINUED', label: 'Discontinued' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="SKU"
          {...register('sku')}
          error={errors.sku?.message}
          placeholder="e.g., SAM-S24-128-BLK"
        />

        <FormInput
          label="Product Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g., Samsung Galaxy S24 128GB Black"
        />

        <FormSelect
          label="Category"
          {...register('categoryId')}
          error={errors.categoryId?.message}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
        />

        <FormSelect
          label="Brand"
          {...register('brandId')}
          error={errors.brandId?.message}
          options={brands.map(b => ({ value: b.id, label: b.name }))}
        />

        <FormInput
          label="Cost Price (KES)"
          type="number"
          {...register('costPrice', { valueAsNumber: true })}
          error={errors.costPrice?.message}
          placeholder="e.g., 85000"
        />

        <FormInput
          label="Reorder Level"
          type="number"
          {...register('reorderLevel', { valueAsNumber: true })}
          error={errors.reorderLevel?.message}
          placeholder="e.g., 5"
        />

        <FormInput
          label="Barcode"
          {...register('barcode')}
          error={errors.barcode?.message}
          placeholder="e.g., 8806095812345"
        />

        <FormSelect
          label="Status"
          {...register('status')}
          error={errors.status?.message}
          options={statusOptions}
        />
      </div>

      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Product description..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
