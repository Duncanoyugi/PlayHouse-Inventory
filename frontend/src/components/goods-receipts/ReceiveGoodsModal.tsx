import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PackageCheck } from 'lucide-react'
import { purchaseOrdersApi } from '../../api/endpoints/purchase-orders.api'
import { goodsReceiptsApi } from '../../api/endpoints/goods-receipts.api'
import { locationsApi } from '../../api/endpoints/locations.api'
import { Modal } from '../common/Modal/Modal'
import { Button } from '../common/Buttons/Button'
import { FormSelect } from '../common/Forms/FormSelect'
import { FormTextarea } from '../common/Forms/FormTextarea'
import { LoadingSpinner } from '../common/Loading/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { formatNumber } from '../../utils/format-utils'
import { getErrorMessage } from '../../utils/error-utils'

interface Line { received: string; damaged: string }

const toInt = (v: string) => (v === '' ? 0 : Number(v))
const isWhole = (n: number) => Number.isInteger(n) && n >= 0

export function ReceiveGoodsModal(props: { purchaseOrderId: string | null; onClose: () => void }) {
  // Re-mount per purchase order so the form always starts clean.
  return <ReceiveGoodsForm key={props.purchaseOrderId ?? 'closed'} {...props} />
}

function ReceiveGoodsForm({ purchaseOrderId, onClose }: { purchaseOrderId: string | null; onClose: () => void }) {
  const qc = useQueryClient()
  const [lines, setLines] = useState<Record<string, Line>>({})
  const [pickedLocation, setPickedLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [touched, setTouched] = useState(false)

  const po = useQuery({ queryKey: ['purchase-orders', purchaseOrderId], queryFn: () => purchaseOrdersApi.getById(purchaseOrderId!), enabled: !!purchaseOrderId })
  const locations = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll(), enabled: !!purchaseOrderId })

  // A shop with a single location never has to pick one.
  const locationId = pickedLocation || ((locations.data?.length ?? 0) === 1 ? locations.data![0].id : '')

  const items = useMemo(() => (po.data?.items ?? []).map((i) => ({ ...i, outstanding: i.quantity - i.receivedQuantity })), [po.data])

  const set = (productId: string, patch: Partial<Line>) =>
    setLines((p) => ({ ...p, [productId]: { ...(p[productId] ?? { received: '', damaged: '' }), ...patch } }))
  const receiveAll = () => setLines(Object.fromEntries(items.filter((i) => i.outstanding > 0).map((i) => [i.productId, { received: String(i.outstanding), damaged: '' }])))

  const problems = (productId: string, outstanding: number) => {
    const l = lines[productId]
    if (!l) return null
    const r = toInt(l.received), d = toInt(l.damaged)
    if (!isWhole(r) || !isWhole(d)) return 'Whole numbers only'
    if (r > outstanding) return `Only ${formatNumber(outstanding)} outstanding`
    if (d > r) return 'Damaged cannot exceed received'
    return null
  }

  const payloadItems = items
    .map((i) => ({ productId: i.productId, receivedQuantity: toInt(lines[i.productId]?.received ?? ''), damagedQuantity: toInt(lines[i.productId]?.damaged ?? '') }))
    .filter((i) => i.receivedQuantity > 0)
  const hasErrors = items.some((i) => problems(i.productId, i.outstanding))
  const accepted = payloadItems.reduce((s, i) => s + i.receivedQuantity - i.damagedQuantity, 0)

  const submit = useMutation({
    mutationFn: () => goodsReceiptsApi.create({ purchaseOrderId: purchaseOrderId!, locationId, notes: notes.trim() || undefined, items: payloadItems }),
    onSuccess: (res) => {
      toast.success(res.message)
      for (const key of ['purchase-orders', 'goods-receipts', 'inventory', 'stock-movements', 'dashboard', 'products']) void qc.invalidateQueries({ queryKey: [key] })
      onClose()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const canSubmit = !!locationId && payloadItems.length > 0 && !hasErrors
  const onSubmit = () => {
    setTouched(true)
    if (canSubmit) submit.mutate()
  }

  return (
    <Modal
      isOpen={!!purchaseOrderId} onClose={onClose} size="xl" locked={submit.isPending}
      title={po.data ? `Receive goods - ${po.data.poNumber}` : 'Receive goods'}
      description={po.data?.supplier?.name}
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={submit.isPending}>Cancel</Button>
        <Button variant="success" icon={<PackageCheck className="h-4 w-4" />} onClick={onSubmit} isLoading={submit.isPending} disabled={touched && !canSubmit}>
          Add {formatNumber(accepted)} unit{accepted === 1 ? '' : 's'} to stock
        </Button>
      </>}
    >
      {po.isLoading && <LoadingSpinner />}
      {po.isError && <ErrorState onRetry={() => void po.refetch()} />}
      {po.data && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Receive into" required placeholder="Select location" value={locationId} onChange={(e) => setPickedLocation(e.target.value)} options={(locations.data ?? []).map((l) => ({ value: l.id, label: l.name }))} error={touched && !locationId ? 'Choose a location' : undefined} />
            <div className="flex items-end"><Button variant="secondary" onClick={receiveAll}>Receive all outstanding</Button></div>
          </div>

          <div className="space-y-3">
            {items.map((i) => {
              const err = problems(i.productId, i.outstanding)
              const done = i.outstanding <= 0
              return (
                <div key={i.id} className={`grid items-start gap-3 rounded-2xl border border-line p-3 sm:grid-cols-12 ${done ? 'opacity-55' : ''}`}>
                  <div className="sm:col-span-5">
                    <p className="font-semibold">{i.product?.name}</p>
                    <p className="text-xs text-muted">{i.product?.sku}</p>
                    <p className="mt-1 text-xs text-muted">Ordered {formatNumber(i.quantity)} - received {formatNumber(i.receivedQuantity)} - <span className="font-semibold text-fg">{done ? 'complete' : `${formatNumber(i.outstanding)} outstanding`}</span></p>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label text-xs">Delivered now</label>
                    <input className="input" type="number" min={0} max={i.outstanding} step={1} inputMode="numeric" disabled={done} value={lines[i.productId]?.received ?? ''} placeholder="0" onChange={(e) => set(i.productId, { received: e.target.value })} aria-label={`Delivered quantity for ${i.product?.name}`} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label text-xs">Of which damaged</label>
                    <input className="input" type="number" min={0} step={1} inputMode="numeric" disabled={done} value={lines[i.productId]?.damaged ?? ''} placeholder="0" onChange={(e) => set(i.productId, { damaged: e.target.value })} aria-label={`Damaged quantity for ${i.product?.name}`} />
                  </div>
                  {err && <p className="field-error sm:col-span-12">{err}</p>}
                </div>
              )
            })}
          </div>
          {touched && payloadItems.length === 0 && <p className="field-error">Enter the delivered quantity for at least one item.</p>}
          <p className="text-xs text-muted">Damaged units are recorded on the receipt but are not added to sellable stock.</p>
          <FormTextarea label="Notes" rows={2} placeholder="Optional - e.g. delivery note number, condition of packaging" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </div>
      )}
    </Modal>
  )
}
