import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersApi } from '../api/endpoints/purchase-orders.api'
import { ActivityTable } from '../components/common/ActivityTable'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/common/Buttons/Button'
import { Modal } from '../components/common/Modal/Modal'
import { PurchaseOrderForm } from '../components/purchase-orders/PurchaseOrderForm'
import type { CreatePurchaseOrderDto } from '../types'

export const PurchaseOrdersPage = () => {
  const client = useQueryClient()
  const { user } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const query = useQuery({ queryKey: ['purchase-orders'], queryFn: () => purchaseOrdersApi.getAll({ page: 1, limit: 100 }) })
  if (query.isLoading) return <LoadingSpinner />
  const rows = query.data?.items || []
  const transition = async (id: string, operation: (id: string) => Promise<unknown>, message: string) => { try { await operation(id); toast.success(message); void client.invalidateQueries({ queryKey: ['purchase-orders'] }) } catch (error: unknown) { toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Unable to update purchase order' : 'Unable to update purchase order') } }
  const create = async (data: CreatePurchaseOrderDto) => { try { await purchaseOrdersApi.create(data); toast.success('Purchase order created'); setIsCreateOpen(false); void client.invalidateQueries({ queryKey: ['purchase-orders'] }) } catch (error: unknown) { toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Unable to create purchase order' : 'Unable to create purchase order') } }
  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Procurement</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Purchase orders</h1><p className="mt-2 text-sm text-slate-500">Track supplier commitments from draft through receiving.</p></div><Button onClick={() => setIsCreateOpen(true)}>Create purchase order</Button></div><ActivityTable title="Order register" description={`${query.data?.total || rows.length} purchase orders`} onRefresh={() => void query.refetch()} rows={rows} columns={[{ key: 'poNumber', label: 'PO number', render: (row) => <span className="font-mono font-semibold text-slate-900">{row.poNumber}</span> }, { key: 'supplier', label: 'Supplier', render: (row) => row.supplier?.name || row.supplierId }, { key: 'orderDate', label: 'Ordered', render: (row) => new Date(row.orderDate).toLocaleDateString() }, { key: 'totalAmount', label: 'Value', render: (row) => `KES ${Number(row.totalAmount || 0).toLocaleString()}` }, { key: 'status', label: 'Status', render: (row) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{row.status}</span> }, { key: 'actions', label: 'Actions', render: (row) => <span className="space-x-3">{row.status === 'DRAFT' && <button className="text-xs font-semibold text-cyan-700" onClick={() => void transition(row.id, purchaseOrdersApi.submit, 'Purchase order submitted')}>Submit</button>}{row.status === 'SUBMITTED' && user?.role === 'ADMIN' && <button className="text-xs font-semibold text-emerald-700" onClick={() => void transition(row.id, purchaseOrdersApi.approve, 'Purchase order approved')}>Approve</button>}{['DRAFT', 'SUBMITTED', 'APPROVED'].includes(row.status) && <button className="text-xs font-semibold text-rose-700" onClick={() => void transition(row.id, purchaseOrdersApi.cancel, 'Purchase order cancelled')}>Cancel</button>}{row.status === 'DRAFT' && user?.role === 'ADMIN' && <button className="text-xs font-semibold text-rose-700" onClick={() => void transition(row.id, purchaseOrdersApi.delete, 'Purchase order deleted')}>Delete</button>}</span> }]} /><Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create purchase order" size="xl"><PurchaseOrderForm onSubmit={(data) => void create(data)} onCancel={() => setIsCreateOpen(false)} /></Modal></div>
}
