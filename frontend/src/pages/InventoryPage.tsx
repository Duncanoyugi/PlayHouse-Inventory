import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, FileWarning, PackageOpen, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { inventoryApi } from '../api/endpoints/inventory.api'
import { locationsApi } from '../api/endpoints/locations.api'
import { Button } from '../components/common/Buttons/Button'
import { Modal } from '../components/common/Modal/Modal'
import { StockInForm } from '../components/inventory/StockInForm'
import { StockOutForm } from '../components/inventory/StockOutForm'
import { AdjustStockForm } from '../components/inventory/AdjustStockForm'
import { DamageForm } from '../components/inventory/DamageForm'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'
import type { InventoryBalance } from '../types'

type Action = 'stock-in' | 'stock-out' | 'adjust' | 'damage'

export const InventoryPage = () => {
  const queryClient = useQueryClient()
  const [locationId, setLocationId] = useState('')
  const [action, setAction] = useState<Action | null>(null)

  const inventoryQuery = useQuery({
    queryKey: ['inventory', locationId],
    queryFn: () => inventoryApi.getAll({ locationId: locationId || undefined, page: 1, limit: 100 }),
  })
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll(),
  })
  const lowStockQuery = useQuery({
    queryKey: ['low-stock', locationId],
    queryFn: () => inventoryApi.getLowStock(locationId || undefined),
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['inventory'] })
    void queryClient.invalidateQueries({ queryKey: ['low-stock'] })
    void queryClient.invalidateQueries({ queryKey: ['inventory-summary'] })
  }

  const submitAction = async (request: Promise<unknown>, successMessage: string) => {
    try {
      await request
      toast.success(successMessage)
      setAction(null)
      refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const rows = inventoryQuery.data?.items || []
  const lowStockCount = lowStockQuery.data?.lowStock.length || 0
  const outOfStockCount = lowStockQuery.data?.outOfStock.length || 0

  if (inventoryQuery.isLoading || locationsQuery.isLoading || lowStockQuery.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Inventory control</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Track balances by location and record every stock movement with an accountable reason.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={refresh} aria-label="Refresh inventory">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" variant="success" onClick={() => setAction('stock-in')}>
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Stock in
          </Button>
          <Button size="sm" variant="primary" onClick={() => setAction('stock-out')}>
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Stock out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Tracked balances" value={rows.length} icon={<PackageOpen className="h-5 w-5" />} tone="cyan" />
        <Metric label="Low stock" value={lowStockCount} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" />
        <Metric label="Out of stock" value={outOfStockCount} icon={<FileWarning className="h-5 w-5" />} tone="rose" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Current balances</h2>
            <p className="text-sm text-slate-500">Available quantity excludes reserved units.</p>
          </div>
          <select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100">
            <option value="">All locations</option>
            {(locationsQuery.data || []).map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">On hand</th><th className="px-4 py-3">Reserved</th><th className="px-4 py-3">Available</th><th className="px-4 py-3">State</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item: InventoryBalance) => {
                const available = item.availableQuantity ?? item.quantity - item.reservedQuantity
                const reorderLevel = item.product?.reorderLevel ?? 0
                const state = available <= 0 ? 'Out of stock' : available <= reorderLevel ? 'Low stock' : 'Healthy'
                return <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-4"><div className="font-medium text-slate-900">{item.product?.name || item.productId}</div><div className="text-xs text-slate-500">{item.product?.sku || 'Unknown SKU'}</div></td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.location?.name || item.locationId}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.quantity}</td><td className="px-4 py-4 text-slate-500">{item.reservedQuantity}</td><td className="px-4 py-4 font-semibold text-slate-900">{available}</td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : state === 'Low stock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{state}</span></td>
                  <td className="whitespace-nowrap px-4 py-4 text-right"><button className="mr-3 text-xs font-semibold text-cyan-700 hover:text-cyan-900" onClick={() => setAction('adjust')}>Adjust</button><button className="text-xs font-semibold text-rose-700 hover:text-rose-900" onClick={() => setAction('damage')}>Damage</button></td>
                </tr>
              })}
              {!rows.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No inventory balances match this location.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={action === 'stock-in'} onClose={() => setAction(null)} title="Record stock in" size="lg"><StockInForm onCancel={() => setAction(null)} onSubmit={(data) => void submitAction(inventoryApi.stockIn(data), 'Stock added successfully')} /></Modal>
      <Modal isOpen={action === 'stock-out'} onClose={() => setAction(null)} title="Record stock out" size="lg"><StockOutForm onCancel={() => setAction(null)} onSubmit={(data) => void submitAction(inventoryApi.stockOut(data), 'Stock removed successfully')} /></Modal>
      <Modal isOpen={action === 'adjust'} onClose={() => setAction(null)} title="Adjust stock" size="lg"><AdjustStockForm onCancel={() => setAction(null)} onSubmit={(data) => void submitAction(inventoryApi.adjust(data), 'Stock adjusted successfully')} /></Modal>
      <Modal isOpen={action === 'damage'} onClose={() => setAction(null)} title="Record damaged stock" size="lg"><DamageForm onCancel={() => setAction(null)} onSubmit={(data) => void submitAction(inventoryApi.damage(data), 'Damage recorded successfully')} /></Modal>
    </div>
  )
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'cyan' | 'amber' | 'rose' }) {
  const styles = { cyan: 'bg-cyan-50 text-cyan-700', amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700' }
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}>{icon}</div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p></div>
}
