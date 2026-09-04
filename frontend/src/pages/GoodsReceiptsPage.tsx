import { useQuery } from '@tanstack/react-query'
import { goodsReceiptsApi } from '../api/endpoints/goods-receipts.api'
import { ActivityTable } from '../components/common/ActivityTable'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'

export const GoodsReceiptsPage = () => {
  const query = useQuery({ queryKey: ['goods-receipts'], queryFn: () => goodsReceiptsApi.getAll({ page: 1, limit: 100 }) })
  if (query.isLoading) return <LoadingSpinner />
  const rows = query.data?.items || []
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Receiving</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Goods receipts</h1><p className="mt-2 text-sm text-slate-500">Review deliveries and the inventory updates created from them.</p></div><ActivityTable title="Receipt register" description={`${query.data?.total || rows.length} receipts`} onRefresh={() => void query.refetch()} rows={rows} columns={[{ key: 'receiptNumber', label: 'Receipt number', render: (row) => <span className="font-mono font-semibold text-slate-900">{row.receiptNumber}</span> }, { key: 'purchaseOrder', label: 'Purchase order', render: (row) => row.purchaseOrder?.poNumber || row.purchaseOrderId }, { key: 'location', label: 'Location', render: (row) => row.location?.name || row.locationId }, { key: 'receivedAt', label: 'Received', render: (row) => new Date(row.receivedAt).toLocaleDateString() }, { key: 'items', label: 'Line items', render: (row) => row.items?.length || 0 }, { key: 'notes', label: 'Notes' }]} /></div>
}
