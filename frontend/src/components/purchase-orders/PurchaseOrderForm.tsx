import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { purchaseOrdersApi } from '../../api/endpoints/purchase-orders.api'
import { suppliersApi } from '../../api/endpoints/suppliers.api'
import { Modal } from '../common/Modal/Modal'
import { Button } from '../common/Buttons/Button'
import { IconButton } from '../common/Buttons/IconButton'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { ProductPicker } from '../common/ProductPicker'
import { formatMoney } from '../../utils/format-utils'
import { getErrorMessage } from '../../utils/error-utils'
import type { Product, PurchaseOrder } from '../../types'

const schema = z.object({
  supplierId: z.string().min(1, 'Choose a supplier'),
  expectedDate: z.string().optional(),
  items: z.array(z.object({
    product: z.custom<Product | null>().refine((p) => !!p, 'Choose a product'),
    quantity: z.coerce.number({ message: 'Enter a quantity' }).int('Whole units only').min(1, 'At least 1').max(1_000_000, 'Too large'),
    unitCost: z.coerce.number({ message: 'Enter a cost' }).min(0, 'Cannot be negative').max(100_000_000, 'Too large')
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'At most 2 decimals'),
  })).min(1, 'Add at least one product'),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>

const blankLine = { product: null, quantity: 1, unitCost: '' } as unknown as In['items'][number]

export function PurchaseOrderForm({ isOpen, order, onClose }: { isOpen: boolean; order: PurchaseOrder | null; onClose: () => void }) {
  const qc = useQueryClient()
  const suppliers = useQuery({ queryKey: ['suppliers', 'ACTIVE'], queryFn: () => suppliersApi.getAll('ACTIVE'), enabled: isOpen })

  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: { supplierId: '', expectedDate: '', items: [blankLine] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (!isOpen) return
    reset(order ? {
      supplierId: order.supplierId,
      expectedDate: order.expectedDate ? order.expectedDate.slice(0, 10) : '',
      items: (order.items ?? []).map((i) => ({ product: (i.product ?? null) as Product | null, quantity: i.quantity, unitCost: Number(i.unitCost ?? 0) })) as In['items'],
    } : { supplierId: '', expectedDate: '', items: [blankLine] })
  }, [isOpen, order, reset])

  const lines = useWatch({ control, name: 'items' }) ?? []
  const total = lines.reduce((s, l) => s + (Number(l?.quantity) || 0) * Math.round((Number(l?.unitCost) || 0) * 100) / 100, 0)
  const chosen = lines.map((l) => l?.product?.id).filter(Boolean) as string[]

  const save = useMutation({
    mutationFn: (v: Out) => {
      const body = {
        supplierId: v.supplierId,
        expectedDate: v.expectedDate ? v.expectedDate : undefined,
        items: v.items.map((l) => ({ productId: l.product!.id, quantity: l.quantity, unitCost: l.unitCost })),
      }
      return order ? purchaseOrdersApi.update(order.id, body) : purchaseOrdersApi.create(body)
    },
    onSuccess: (po) => {
      toast.success(order ? 'Purchase order updated' : `Purchase order ${po.poNumber} created as draft`)
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      onClose()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} locked={save.isPending} size="xl"
      title={order ? `Edit ${order.poNumber}` : 'New purchase order'}
      description="Saved as a draft. Submit and approve it when you are ready to order."
      footer={<><Button variant="secondary" onClick={onClose} disabled={save.isPending}>Cancel</Button><Button type="submit" form="po-form" isLoading={save.isPending}>{order ? 'Save changes' : 'Create draft'}</Button></>}
    >
      <form id="po-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Supplier" required placeholder="Select supplier" options={(suppliers.data ?? []).map((s) => ({ value: s.id, label: s.name }))} error={errors.supplierId?.message} {...register('supplierId')} />
          <FormInput label="Expected delivery" type="date" min={today} hint="Optional" error={errors.expectedDate?.message} {...register('expectedDate')} />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-fg">Items</h4>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => append(blankLine)}>Add item</Button>
          </div>
          {typeof errors.items?.message === 'string' && <p className="field-error mb-2">{errors.items.message}</p>}
          <div className="space-y-3">
            {fields.map((f, i) => {
              const line = lines[i]
              const lineTotal = (Number(line?.quantity) || 0) * (Number(line?.unitCost) || 0)
              return (
                <div key={f.id} className="grid gap-3 rounded-2xl border border-line bg-surface-2/40 p-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <Controller control={control} name={`items.${i}.product`} render={({ field }) => (
                      <ProductPicker
                        label="Product" activeOnly value={(field.value as Product | null) ?? null}
                        excludeIds={chosen.filter((id) => id !== (field.value as Product | null)?.id)}
                        error={(errors.items?.[i]?.product as { message?: string } | undefined)?.message}
                        onChange={(p) => {
                          field.onChange(p)
                          // Pre-fill the unit cost from the product's cost price (editable).
                          if (p && !Number(line?.unitCost)) setValue(`items.${i}.unitCost`, (Number(p.costPrice ?? 0) || '') as never)
                        }}
                      />
                    )} />
                  </div>
                  <div className="sm:col-span-2"><FormInput label="Qty" type="number" min={1} step={1} inputMode="numeric" error={errors.items?.[i]?.quantity?.message} {...register(`items.${i}.quantity`)} /></div>
                  <div className="sm:col-span-3"><FormInput label="Unit cost" type="number" min={0} step="0.01" inputMode="decimal" suffix="KES" error={errors.items?.[i]?.unitCost?.message} {...register(`items.${i}.unitCost`)} /></div>
                  <div className="flex items-end justify-between gap-2 sm:col-span-2">
                    <div className="pb-2.5 text-right"><p className="text-xs text-muted">Line total</p><p className="text-sm font-bold tabular-nums">{formatMoney(lineTotal)}</p></div>
                    <IconButton label="Remove item" tone="danger" disabled={fields.length === 1} onClick={() => remove(i)} className="mb-1"><Trash2 className="h-4 w-4" /></IconButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-brand-500/10 px-5 py-4">
          <span className="text-sm font-medium text-muted">Order total</span>
          <span className="text-xl font-bold tabular-nums text-fg">{formatMoney(total)}</span>
        </div>
      </form>
    </Modal>
  )
}
