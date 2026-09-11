import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../../api/endpoints/products.api'
import { suppliersApi } from '../../api/endpoints/suppliers.api'
import type { CreatePurchaseOrderDto } from '../../types'
import { Button } from '../common/Buttons/Button'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'

type PurchaseOrderFormProps = { onSubmit: (data: CreatePurchaseOrderDto) => void; onCancel: () => void }
type Line = CreatePurchaseOrderDto['items'][number]

export function PurchaseOrderForm({ onSubmit, onCancel }: PurchaseOrderFormProps) {
  const [supplierId, setSupplierId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: 1, unitCost: 0 }])
  const suppliersQuery = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersApi.getAll('ACTIVE') })
  const productsQuery = useQuery({ queryKey: ['products-active'], queryFn: () => productsApi.getAll({ status: 'ACTIVE', limit: 100 }) })
  const products = productsQuery.data?.items || []

  const updateLine = (index: number, field: keyof Line, value: string) => {
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: field === 'productId' ? value : Number(value) } : line))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!supplierId || lines.some((line) => !line.productId || line.quantity < 1 || line.unitCost < 0)) return
    onSubmit({ supplierId, expectedDate: expectedDate || undefined, items: lines })
  }

  return <form className="space-y-5" onSubmit={submit}>
    <FormSelect label="Supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} options={[{ value: '', label: 'Select supplier' }, ...(suppliersQuery.data || []).map((supplier) => ({ value: supplier.id, label: supplier.name }))]} />
    <FormInput label="Expected delivery" type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} />
    <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">Order items</h3><Button type="button" size="sm" variant="outline" onClick={() => setLines([...lines, { productId: '', quantity: 1, unitCost: 0 }])}>Add item</Button></div>
      {lines.map((line, index) => <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_100px_130px_auto]"><FormSelect label="Product" value={line.productId} onChange={(event) => updateLine(index, 'productId', event.target.value)} options={[{ value: '', label: 'Select product' }, ...products.map((product) => ({ value: product.id, label: `${product.sku} - ${product.name}` }))]} /><FormInput label="Quantity" type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} /><FormInput label="Unit cost" type="number" min="0" value={line.unitCost} onChange={(event) => updateLine(index, 'unitCost', event.target.value)} />{lines.length > 1 && <button type="button" className="self-end pb-2 text-sm font-semibold text-rose-700" onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}>Remove</button>}</div>)}
    </div>
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Create purchase order</Button></div>
  </form>
}

