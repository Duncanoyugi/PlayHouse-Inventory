import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { locationsApi } from '../../api/endpoints/locations.api'
import { purchaseOrdersApi } from '../../api/endpoints/purchase-orders.api'
import type { CreateGoodsReceiptDto } from '../../types'
import { Button } from '../common/Buttons/Button'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { FormTextarea } from '../common/Forms/FormTextarea'

type GoodsReceiptFormProps = { onSubmit: (data: CreateGoodsReceiptDto) => void; onCancel: () => void }
type ReceiptLine = CreateGoodsReceiptDto['items'][number]

export function GoodsReceiptForm({ onSubmit, onCancel }: GoodsReceiptFormProps) {
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ReceiptLine[]>([])
  const ordersQuery = useQuery({ queryKey: ['receivable-purchase-orders'], queryFn: () => purchaseOrdersApi.getAll({ page: 1, limit: 100 }) })
  const locationsQuery = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll() })
  const orders = useMemo(() => (ordersQuery.data?.items || []).filter((order) => order.status === 'APPROVED' || order.status === 'PARTIALLY_RECEIVED'), [ordersQuery.data])
  const selectedOrder = orders.find((order) => order.id === purchaseOrderId)
  const selectOrder = (id: string) => { setPurchaseOrderId(id); const order = orders.find((item) => item.id === id); setItems((order?.items || []).filter((item) => item.quantity > item.receivedQuantity).map((item) => ({ productId: item.productId, receivedQuantity: 1, damagedQuantity: 0 }))) }
  const updateItem = (index: number, field: keyof ReceiptLine, value: string) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: Number(value) } : item))
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!purchaseOrderId || !locationId || !items.length || items.some((item) => item.receivedQuantity < 1 || item.damagedQuantity < 0 || item.damagedQuantity > item.receivedQuantity)) return; onSubmit({ purchaseOrderId, locationId, notes: notes || undefined, items }) }
  return <form className="space-y-5" onSubmit={submit}><FormSelect label="Approved purchase order" value={purchaseOrderId} onChange={(event) => selectOrder(event.target.value)} options={[{ value: '', label: 'Select purchase order' }, ...orders.map((order) => ({ value: order.id, label: `${order.poNumber} - ${order.supplier?.name || order.supplierId}` }))]} /><FormSelect label="Receiving location" value={locationId} onChange={(event) => setLocationId(event.target.value)} options={[{ value: '', label: 'Select location' }, ...(locationsQuery.data || []).map((location) => ({ value: location.id, label: location.name }))]} />{selectedOrder && <div className="space-y-3"><h3 className="text-sm font-semibold text-slate-900">Items to receive</h3>{items.map((item, index) => { const orderItem = selectedOrder.items?.find((line) => line.productId === item.productId); const remaining = (orderItem?.quantity || 0) - (orderItem?.receivedQuantity || 0); return <div key={item.productId} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_110px_110px]"><div><p className="text-sm font-medium text-slate-900">{orderItem?.product?.name || item.productId}</p><p className="text-xs text-slate-500">Remaining: {remaining}</p></div><FormInput label="Received" type="number" min="1" max={remaining} value={item.receivedQuantity} onChange={(event) => updateItem(index, 'receivedQuantity', event.target.value)} /><FormInput label="Damaged" type="number" min="0" max={remaining} value={item.damagedQuantity} onChange={(event) => updateItem(index, 'damagedQuantity', event.target.value)} /></div>})}</div>}<FormTextarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional receiving notes" rows={3} /><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Receive goods</Button></div></form>
}

