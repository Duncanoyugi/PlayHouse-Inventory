import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { FormTextarea } from '../common/Forms/FormTextarea'
import { Button } from '../common/Buttons/Button'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/endpoints/products.api'
import { locationsApi } from '../../api/endpoints/locations.api'

const adjustSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  locationId: z.string().min(1, 'Location is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  type: z.enum(['INCREASE', 'DECREASE']),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
})

type AdjustStockFormData = z.infer<typeof adjustSchema>

interface AdjustStockFormProps {
  onSubmit: (data: AdjustStockFormData) => void
  onCancel: () => void
}

export const AdjustStockForm: React.FC<AdjustStockFormProps> = ({ onSubmit, onCancel }) => {
  const { data: productsData } = useQuery({
    queryKey: ['products-active'],
    queryFn: () => productsApi.getAll({ status: 'ACTIVE', limit: 100 }),
  })

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: 'INCREASE' },
  })

  const products = productsData?.items || []
  const locations = locationsData || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Product"
        {...register('productId')}
        error={errors.productId?.message}
        options={products.map((p: any) => ({ value: p.id, label: `${p.sku} - ${p.name}` }))}
      />

      <FormSelect
        label="Location"
        {...register('locationId')}
        error={errors.locationId?.message}
        options={locations.map((l: any) => ({ value: l.id, label: l.name }))}
      />

      <FormSelect
        label="Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: 'INCREASE', label: 'Increase' },
          { value: 'DECREASE', label: 'Decrease' },
        ]}
      />

      <FormInput
        label="Quantity"
        type="number"
        {...register('quantity', { valueAsNumber: true })}
        error={errors.quantity?.message}
        placeholder="e.g., 5"
      />

      <FormTextarea
        label="Reason"
        {...register('reason')}
        error={errors.reason?.message}
        placeholder="e.g., Stock correction"
        rows={2}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Adjust Stock
        </Button>
      </div>
    </form>
  )
}
