import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PackageCheck, Truck } from 'lucide-react'
import { goodsReceiptsApi } from '../api/endpoints/goods-receipts.api'
import { purchaseOrdersApi } from '../api/endpoints/purchase-orders.api'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Buttons/Button'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { EmptyState } from '../components/common/EmptyState'
import { ReceiveGoodsModal } from '../components/goods-receipts/ReceiveGoodsModal'
import { GoodsReceiptDetail } from '../components/goods-receipts/GoodsReceiptDetail'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate, formatDateTime } from '../utils/format-utils'
import type { GoodsReceipt } from '../types'

export default function GoodsReceiptsPage() {
  usePageTitle('Goods receiving')
  const [params, setParams] = useSearchParams()
  const [receiveId, setReceiveId] = useState<string | null>(() => params.get('receive'))
  const [viewId, setViewId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 15

  // Deep link from a purchase order: /goods-receipts?receive=<id>
  useEffect(() => {
    if (params.get('receive')) setParams({}, { replace: true })
  }, [params, setParams])

  const approved = useQuery({ queryKey: ['purchase-orders', 'awaiting', 'APPROVED'], queryFn: () => purchaseOrdersApi.getAll({ status: 'APPROVED', limit: 50 }) })
  const partial = useQuery({ queryKey: ['purchase-orders', 'awaiting', 'PARTIALLY_RECEIVED'], queryFn: () => purchaseOrdersApi.getAll({ status: 'PARTIALLY_RECEIVED', limit: 50 }) })
  const awaiting = [...(partial.data?.items ?? []), ...(approved.data?.items ?? [])]

  const list = useQuery({ queryKey: ['goods-receipts', 'list', page], queryFn: () => goodsReceiptsApi.getAll({ page, limit }), placeholderData: keepPreviousData })

  const columns: Column<GoodsReceipt>[] = [
    { key: 'no', header: 'Receipt', cell: (r) => <span className="font-semibold">{r.receiptNumber}</span> },
    { key: 'po', header: 'Purchase order', cell: (r) => <div><p>{r.purchaseOrder?.poNumber}</p><p className="text-xs text-muted">{r.purchaseOrder?.supplier?.name}</p></div> },
    { key: 'loc', header: 'Location', hideBelow: 'md', cell: (r) => r.location?.name },
    { key: 'lines', header: 'Lines', align: 'right', hideBelow: 'sm', cell: (r) => r._count?.items ?? 0 },
    { key: 'by', header: 'Received by', hideBelow: 'lg', cell: (r) => r.receiver?.fullName },
    { key: 'when', header: 'Received', cell: (r) => <span className="whitespace-nowrap text-muted">{formatDateTime(r.receivedAt)}</span> },
  ]

  return (
    <>
      <PageHeader eyebrow="Store" title="Goods receiving" description="Book in deliveries against approved purchase orders. Accepted units go straight into stock." />

      <section className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/14 text-amber-600"><Truck className="h-5 w-5" /></span>
          <div><h2 className="text-base font-semibold">Awaiting delivery</h2><p className="text-sm text-muted">Approved orders you can receive now.</p></div>
        </div>
        {approved.isLoading || partial.isLoading ? (
          <div className="p-5"><div className="skeleton h-14 w-full" /></div>
        ) : awaiting.length === 0 ? (
          <EmptyState icon={<PackageCheck className="h-6 w-6" />} title="Nothing waiting" description="When the manager approves a purchase order it will show up here." />
        ) : (
          <ul className="divide-y divide-line">
            {awaiting.map((po) => (
              <li key={po.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold">{po.poNumber} <span className="ml-1"><StatusBadge status={po.status} /></span></p>
                  <p className="text-sm text-muted">{po.supplier?.name} - expected {formatDate(po.expectedDate)} - {po._count?.items ?? 0} line(s)</p>
                </div>
                <Button size="sm" icon={<PackageCheck className="h-4 w-4" />} onClick={() => setReceiveId(po.id)}>Receive</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="text-base font-semibold">Receipt history</h2></div>
        <DataTable columns={columns} rows={list.data?.items ?? []} rowKey={(r) => r.id} isLoading={list.isLoading} isError={list.isError} onRetry={() => void list.refetch()} onRowClick={(r) => setViewId(r.id)} empty={{ title: 'No deliveries received yet' }} />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>

      <ReceiveGoodsModal purchaseOrderId={receiveId} onClose={() => setReceiveId(null)} />
      <GoodsReceiptDetail id={viewId} onClose={() => setViewId(null)} />
    </>
  )
}
