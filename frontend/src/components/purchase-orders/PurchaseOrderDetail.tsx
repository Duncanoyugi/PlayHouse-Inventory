import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle2, Pencil, PackageCheck, Send, Trash2, XCircle } from 'lucide-react'
import { purchaseOrdersApi } from '../../api/endpoints/purchase-orders.api'
import { Modal } from '../common/Modal/Modal'
import { ConfirmModal } from '../common/Modal/ConfirmModal'
import { Button } from '../common/Buttons/Button'
import { StatusBadge } from '../common/Badges/StatusBadge'
import { LoadingSpinner } from '../common/Loading/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { usePermissions } from '../../hooks/usePermissions'
import { ROUTES } from '../../routes/route-constants'
import { formatDate, formatDateTime, formatMoney, formatNumber } from '../../utils/format-utils'
import { getErrorMessage } from '../../utils/error-utils'
import type { PurchaseOrder } from '../../types'

type Action = 'submit' | 'approve' | 'cancel' | 'delete'

const COPY: Record<Action, { title: string; message: (po: PurchaseOrder) => string; label: string; tone: 'primary' | 'success' | 'danger' }> = {
  submit: { title: 'Submit for approval?', message: (po) => `${po.poNumber} will be locked for editing and sent for approval.`, label: 'Submit', tone: 'primary' },
  approve: { title: 'Approve purchase order?', message: (po) => `Once approved, ${po.poNumber} can be received into stock.`, label: 'Approve', tone: 'success' },
  cancel: { title: 'Cancel purchase order?', message: (po) => `${po.poNumber} will be cancelled and can no longer be received. This cannot be undone.`, label: 'Cancel order', tone: 'danger' },
  delete: { title: 'Delete draft?', message: (po) => `${po.poNumber} will be permanently deleted.`, label: 'Delete', tone: 'danger' },
}

export function PurchaseOrderDetail({ id, onClose, onEdit }: { id: string | null; onClose: () => void; onEdit: (po: PurchaseOrder) => void }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const [pending, setPending] = useState<Action | null>(null)

  const { data: po, isLoading, isError, refetch } = useQuery({ queryKey: ['purchase-orders', id], queryFn: () => purchaseOrdersApi.getById(id!), enabled: !!id })

  const run = useMutation<unknown, Error, Action>({
    mutationFn: (action: Action) => {
      if (!po) throw new Error('No purchase order')
      return action === 'submit' ? purchaseOrdersApi.submit(po.id)
        : action === 'approve' ? purchaseOrdersApi.approve(po.id)
        : action === 'cancel' ? purchaseOrdersApi.cancel(po.id)
        : purchaseOrdersApi.delete(po.id)
    },
    onSuccess: (_r, action) => {
      toast.success(action === 'delete' ? 'Draft deleted' : `Purchase order ${action === 'cancel' ? 'cancelled' : action === 'submit' ? 'submitted' : 'approved'}`)
      void qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      if (action === 'delete') onClose()
    },
    onError: (e) => { toast.error(getErrorMessage(e)); throw e },
  })

  const manage = can('po:manage')
  const showCost = can('cost:view')
  const receivable = po && (po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED')

  return (
    <>
      <Modal isOpen={!!id} onClose={onClose} size="xl" title={po?.poNumber ?? 'Purchase order'} description={po?.supplier?.name}>
        {isLoading && <LoadingSpinner />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {po && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={po.status} />
              <div className="flex flex-wrap gap-2">
                {manage && po.status === 'DRAFT' && <Button variant="secondary" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(po)}>Edit</Button>}
                {manage && po.status === 'DRAFT' && <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => setPending('submit')}>Submit</Button>}
                {manage && po.status === 'SUBMITTED' && <Button variant="success" size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setPending('approve')}>Approve</Button>}
                {can('receipt:create') && receivable && <Button size="sm" icon={<PackageCheck className="h-4 w-4" />} onClick={() => navigate(`${ROUTES.GOODS_RECEIPTS}?receive=${po.id}`)}>Receive goods</Button>}
                {manage && ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status) && <Button variant="secondary" size="sm" icon={<XCircle className="h-4 w-4" />} onClick={() => setPending('cancel')}>Cancel order</Button>}
                {manage && po.status === 'DRAFT' && <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => setPending('delete')}>Delete</Button>}
              </div>
            </div>

            <dl className="grid gap-4 rounded-2xl bg-surface-2/60 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-muted">Order date</dt><dd className="font-semibold">{formatDate(po.orderDate)}</dd></div>
              <div><dt className="text-muted">Expected</dt><dd className="font-semibold">{formatDate(po.expectedDate)}</dd></div>
              <div><dt className="text-muted">Created by</dt><dd className="font-semibold">{po.creator?.fullName ?? '-'}</dd></div>
              <div><dt className="text-muted">Approved by</dt><dd className="font-semibold">{po.approver?.fullName ?? '-'}{po.approvedAt && <span className="block text-xs font-normal text-muted">{formatDateTime(po.approvedAt)}</span>}</dd></div>
            </dl>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-surface-2/60"><tr>
                  <th className="th">Product</th><th className="th text-right">Ordered</th><th className="th text-right">Received</th><th className="th text-right">Outstanding</th>
                  {showCost && <><th className="th text-right">Unit cost</th><th className="th text-right">Total</th></>}
                </tr></thead>
                <tbody className="divide-y divide-line">
                  {(po.items ?? []).map((i) => (
                    <tr key={i.id}>
                      <td className="td"><p className="font-semibold">{i.product?.name}</p><p className="text-xs text-muted">{i.product?.sku}</p></td>
                      <td className="td text-right tabular-nums">{formatNumber(i.quantity)}</td>
                      <td className="td text-right tabular-nums">{formatNumber(i.receivedQuantity)}</td>
                      <td className="td text-right font-semibold tabular-nums">{formatNumber(i.quantity - i.receivedQuantity)}</td>
                      {showCost && <><td className="td text-right tabular-nums">{formatMoney(i.unitCost)}</td><td className="td text-right tabular-nums">{formatMoney(i.totalCost)}</td></>}
                    </tr>
                  ))}
                </tbody>
                {showCost && <tfoot><tr><td className="td text-right font-semibold" colSpan={5}>Order total</td><td className="td text-right text-base font-bold tabular-nums">{formatMoney(po.totalAmount)}</td></tr></tfoot>}
              </table>
            </div>

            {(po.goodsReceipts?.length ?? 0) > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Deliveries received</h4>
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {po.goodsReceipts!.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <span className="font-semibold">{r.receiptNumber}</span>
                      <span className="text-muted">{formatDateTime(r.receivedAt)} - {r.receiver?.fullName} - {r.location?.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!pending && !!po}
        title={pending ? COPY[pending].title : ''}
        message={pending && po ? COPY[pending].message(po) : ''}
        confirmLabel={pending ? COPY[pending].label : 'Confirm'}
        tone={pending ? COPY[pending].tone : 'primary'}
        onConfirm={() => run.mutateAsync(pending!)}
        onClose={() => setPending(null)}
      />
    </>
  )
}
