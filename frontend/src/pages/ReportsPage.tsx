import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/endpoints/reports.api'
import { ActivityTable } from '../components/common/ActivityTable'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'

export const ReportsPage = () => {
  const summary = useQuery({ queryKey: ['report-summary'], queryFn: () => reportsApi.getInventorySummary() })
  const valuation = useQuery({ queryKey: ['report-valuation'], queryFn: () => reportsApi.getValuationReport() })
  const lowStock = useQuery({ queryKey: ['report-low-stock'], queryFn: () => reportsApi.getLowStockReport() })
  if (summary.isLoading || valuation.isLoading || lowStock.isLoading) return <LoadingSpinner />
  const totals: any = summary.data || {}
  const valuationPayload: any = valuation.data
  const lowStockPayload: any = lowStock.data
  const valuationRows: any[] = Array.isArray(valuationPayload) ? valuationPayload : valuationPayload?.items || []
  const lowRows: any[] = Array.isArray(lowStockPayload) ? lowStockPayload : lowStockPayload?.lowStock || []
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Business intelligence</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Reports</h1><p className="mt-2 text-sm text-slate-500">A clear view of stock health, exposure, and replenishment pressure.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Inventory value', `KES ${Number(totals.totalInventoryValue || 0).toLocaleString()}`], ['Units on hand', totals.totalQuantity || 0], ['Low stock items', totals.lowStockItems || lowRows.length], ['Out of stock', totals.outOfStockItems || 0]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></div>)}</div><ActivityTable title="Valuation by product" description="Current stock value at recorded cost price." rows={valuationRows} columns={[{ key: 'productName', label: 'Product' }, { key: 'sku', label: 'SKU' }, { key: 'quantity', label: 'Quantity' }, { key: 'unitCost', label: 'Unit cost', render: (row) => `KES ${Number(row.unitCost || 0).toLocaleString()}` }, { key: 'totalValue', label: 'Total value', render: (row) => `KES ${Number(row.totalValue || 0).toLocaleString()}` }]} /><ActivityTable title="Replenishment watchlist" description="Items requiring purchasing attention." rows={lowRows} columns={[{ key: 'product', label: 'Product', render: (row) => row.product?.name || row.productName }, { key: 'location', label: 'Location', render: (row) => row.location?.name || '-' }, { key: 'availableQuantity', label: 'Available' }, { key: 'shortfall', label: 'Shortfall' }]} /></div>
}
