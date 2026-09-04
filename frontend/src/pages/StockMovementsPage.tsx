import { useQuery } from '@tanstack/react-query'
import { stockMovementsApi } from '../api/endpoints/stock-movements.api'
import { ActivityTable } from '../components/common/ActivityTable'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'

export const StockMovementsPage = () => {
  const query = useQuery({ queryKey: ['stock-movements'], queryFn: () => stockMovementsApi.getAll({ page: 1, limit: 100 }) })
  if (query.isLoading) return <LoadingSpinner />
  const rows = query.data?.items || []
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Traceability</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Stock movements</h1><p className="mt-2 text-sm text-slate-500">Every quantity change, reason, and resulting balance in one timeline.</p></div><ActivityTable title="Movement ledger" description={`${query.data?.total || rows.length} recorded movements`} rows={rows} onRefresh={() => void query.refetch()} columns={[{ key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() }, { key: 'type', label: 'Type', render: (row) => <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{row.type}</span> }, { key: 'product', label: 'Product', render: (row) => row.product?.name || row.productId }, { key: 'quantity', label: 'Quantity' }, { key: 'previousQuantity', label: 'Before' }, { key: 'newQuantity', label: 'After' }, { key: 'reason', label: 'Reason' }]} /></div>
}
