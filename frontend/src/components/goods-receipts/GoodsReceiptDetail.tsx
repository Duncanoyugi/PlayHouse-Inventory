import { useQuery } from '@tanstack/react-query'
import { goodsReceiptsApi } from '../../api/endpoints/goods-receipts.api'
import { Modal } from '../common/Modal/Modal'
import { LoadingSpinner } from '../common/Loading/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { formatDateTime, formatNumber } from '../../utils/format-utils'

export function GoodsReceiptDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: r, isLoading, isError, refetch } = useQuery({ queryKey: ['goods-receipts', id], queryFn: () => goodsReceiptsApi.getById(id!), enabled: !!id })
  return (
    <Modal isOpen={!!id} onClose={onClose} size="lg" title={r?.receiptNumber ?? 'Goods receipt'} description={r ? `Against ${r.purchaseOrder?.poNumber} - ${r.purchaseOrder?.supplier?.name}` : undefined}>
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {r && (
        <div className="space-y-5">
          <dl className="grid gap-4 rounded-2xl bg-surface-2/60 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-muted">Received</dt><dd className="font-semibold">{formatDateTime(r.receivedAt)}</dd></div>
            <div><dt className="text-muted">Received by</dt><dd className="font-semibold">{r.receiver?.fullName}</dd></div>
            <div><dt className="text-muted">Location</dt><dd className="font-semibold">{r.location?.name}</dd></div>
          </dl>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-surface-2/60"><tr><th className="th">Product</th><th className="th text-right">Ordered</th><th className="th text-right">Delivered</th><th className="th text-right">Damaged</th><th className="th text-right">Added to stock</th></tr></thead>
              <tbody className="divide-y divide-line">
                {(r.items ?? []).map((i) => (
                  <tr key={i.id}>
                    <td className="td"><p className="font-semibold">{i.product?.name}</p><p className="text-xs text-muted">{i.product?.sku}</p></td>
                    <td className="td text-right tabular-nums">{formatNumber(i.orderedQuantity)}</td>
                    <td className="td text-right tabular-nums">{formatNumber(i.receivedQuantity)}</td>
                    <td className="td text-right tabular-nums">{i.damagedQuantity > 0 ? <span className="font-semibold text-rose-600">{formatNumber(i.damagedQuantity)}</span> : 0}</td>
                    <td className="td text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatNumber(i.acceptedQuantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.notes && <div><p className="text-sm text-muted">Notes</p><p className="mt-1 text-sm">{r.notes}</p></div>}
        </div>
      )}
    </Modal>
  )
}
