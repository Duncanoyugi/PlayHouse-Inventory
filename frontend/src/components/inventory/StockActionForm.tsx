import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { inventoryApi } from '../../api/endpoints/inventory.api'
import { locationsApi } from '../../api/endpoints/locations.api'
import { ProductPicker } from '../common/ProductPicker'
import { Button } from '../common/Buttons/Button'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { FormTextarea } from '../common/Forms/FormTextarea'
import { formatNumber } from '../../utils/format-utils'
import { getErrorMessage } from '../../utils/error-utils'
import { MODE_META, type StockMode } from './stock-modes'
import type { Product } from '../../types'

const schema = z.object({
  locationId: z.string().min(1, 'Choose a location'),
  quantity: z.coerce.number({ message: 'Enter a quantity' }).int('Whole units only').min(1, 'At least 1').max(1_000_000, 'Too large'),
  adjustType: z.enum(['INCREASE', 'DECREASE']),
  reason: z.string().trim().min(3, 'Give a short reason (at least 3 characters)').max(255, 'Reason is too long'),
  reference: z.string().trim().max(100, 'Too long').optional(),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>
const blank = (locationId = ''): In => ({ locationId, quantity: '' as unknown as number, adjustType: 'INCREASE', reason: '', reference: '' })

interface Props {
  mode: StockMode
  defaultProduct?: Product | null
  defaultLocationId?: string
  lockProduct?: boolean
  onDone?: () => void
  onCancel?: () => void
}

export function StockActionForm({ mode, defaultProduct = null, defaultLocationId, lockProduct, onDone, onCancel }: Props) {
  const meta = MODE_META[mode]
  const qc = useQueryClient()
  const [product, setProduct] = useState<Product | null>(defaultProduct)
  const [productError, setProductError] = useState<string>()

  const locations = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll() })
  const { register, control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: blank(defaultLocationId),
  })

  const [locationId, quantityRaw, adjustType, reasonValue] = useWatch({ control, name: ['locationId', 'quantity', 'adjustType', 'reason'] })

  // Auto-select the location when the shop only has one.
  useEffect(() => {
    const list = locations.data ?? []
    if (list.length === 1 && !locationId) setValue('locationId', list[0].id)
  }, [locations.data, setValue, locationId])

  const quantity = Number(quantityRaw) || 0

  const balance = useQuery({
    queryKey: ['inventory', 'balance', product?.id, locationId],
    queryFn: () => inventoryApi.getAll({ productId: product!.id, locationId, limit: 1 }),
    enabled: !!product && !!locationId,
  })
  const available = balance.data?.items[0]?.availableQuantity ?? 0
  const onHand = balance.data?.items[0]?.quantity ?? 0

  const removing = mode === 'out' || mode === 'damage' || (mode === 'adjust' && adjustType === 'DECREASE')
  const limit = mode === 'adjust' ? onHand : available
  const overLimit = removing && !!product && !!locationId && !balance.isLoading && quantity > limit

  const run = useMutation({
    mutationFn: (v: Out) => {
      const base = { productId: product!.id, locationId: v.locationId, quantity: v.quantity, reason: v.reason, reference: v.reference || undefined }
      if (mode === 'in') return inventoryApi.stockIn(base)
      if (mode === 'out') return inventoryApi.stockOut(base)
      if (mode === 'damage') return inventoryApi.damage(base)
      return inventoryApi.adjust({ productId: base.productId, locationId: base.locationId, quantity: base.quantity, reason: base.reason, type: v.adjustType })
    },
    onSuccess: (res) => {
      toast.success(res?.message ?? 'Saved')
      for (const key of ['inventory', 'stock-movements', 'dashboard', 'products', 'product-picker']) void qc.invalidateQueries({ queryKey: [key] })
      reset(blank(locationId))
      if (!lockProduct) setProduct(null)
      onDone?.()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const submit = handleSubmit(
    (v) => {
      if (!product) { setProductError('Choose a product'); return }
      setProductError(undefined)
      if (overLimit) { setError('quantity', { message: `Only ${formatNumber(limit)} available` }); return }
      run.mutate(v)
    },
    // The product picker is not a registered field, so flag it even when other fields are invalid too.
    () => { if (!product) setProductError('Choose a product') },
  )

  const locationOptions = useMemo(() => (locations.data ?? []).map((l) => ({ value: l.id, label: l.name })), [locations.data])
  const Icon = meta.icon

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="flex items-start gap-2 rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted"><Icon className="mt-0.5 h-4 w-4 shrink-0" />{meta.help}</p>

      <ProductPicker
        label="Product" value={product} activeOnly={mode === 'in'} disabled={lockProduct || run.isPending}
        onChange={(p) => { setProduct(p); setProductError(undefined) }} error={productError}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect label="Location" required placeholder="Select location" options={locationOptions} error={errors.locationId?.message} {...register('locationId')} />
        {mode === 'adjust' ? (
          <FormSelect label="Correction" options={[{ value: 'INCREASE', label: 'Increase stock' }, { value: 'DECREASE', label: 'Decrease stock' }]} {...register('adjustType')} />
        ) : (
          <FormInput label="Reference" placeholder={mode === 'in' ? 'Invoice / delivery note no.' : 'Receipt / order no.'} hint="Optional" error={errors.reference?.message} {...register('reference')} />
        )}
      </div>

      <div>
        <FormInput label="Quantity" required type="number" inputMode="numeric" min={1} step={1} placeholder="0" error={errors.quantity?.message ?? (overLimit ? `Only ${formatNumber(limit)} available` : undefined)} {...register('quantity')} />
        {product && locationId && (
          <p className="hint">
            {balance.isLoading ? 'Checking stock...' : <>Currently <span className="font-semibold text-fg">{formatNumber(onHand)}</span> on hand{removing && mode !== 'adjust' ? <>, <span className="font-semibold text-fg">{formatNumber(available)}</span> available</> : null}
            {quantity > 0 && !overLimit && <> &rarr; <span className="font-semibold text-fg">{formatNumber(removing ? onHand - quantity : onHand + quantity)}</span> after this</>}</>}
          </p>
        )}
      </div>

      <div>
        <FormTextarea label="Reason" required rows={2} placeholder="Why is this stock moving?" error={errors.reason?.message} {...register('reason')} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {meta.presets.map((p) => (
            <button key={p} type="button" onClick={() => setValue('reason', p, { shouldValidate: true })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${reasonValue === p ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-line text-muted hover:border-brand-500/50 hover:text-fg'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={run.isPending}>Cancel</Button>}
        <Button type="submit" variant={meta.tone} size="lg" icon={<Icon className="h-4 w-4" />} isLoading={run.isPending} disabled={overLimit}>{meta.verb}</Button>
      </div>
    </form>
  )
}
