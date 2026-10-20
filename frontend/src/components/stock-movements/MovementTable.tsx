import { DataTable, type Column } from '../common/Table/DataTable'
import { StatusBadge } from '../common/Badges/StatusBadge'
import { formatDateTime, formatNumber } from '../../utils/format-utils'
import { movementDelta } from '../../utils/movement-utils'
import type { StockMovement } from '../../types'

export function MovementTable({ rows, isLoading, isError, onRetry, compact }: { rows: StockMovement[]; isLoading?: boolean; isError?: boolean; onRetry?: () => void; compact?: boolean }) {
  const columns: Column<StockMovement>[] = [
    { key: 'when', header: 'When', cell: (m) => <span className="whitespace-nowrap text-muted">{formatDateTime(m.createdAt)}</span> },
    { key: 'product', header: 'Product', cell: (m) => <div className="min-w-[150px]"><p className="font-semibold">{m.product?.name ?? '-'}</p><p className="text-xs text-muted">{m.inventory?.location?.name ?? ''}</p></div> },
    { key: 'type', header: 'Type', cell: (m) => <StatusBadge status={m.type} /> },
    {
      key: 'qty', header: 'Change', align: 'right',
      cell: (m) => {
        const d = movementDelta(m)
        return <span className={`font-bold tabular-nums ${d >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{d > 0 ? '+' : ''}{formatNumber(d)}</span>
      },
    },
    ...(compact ? [] : [{ key: 'balance', header: 'Balance', align: 'right' as const, hideBelow: 'md' as const, cell: (m: StockMovement) => <span className="whitespace-nowrap tabular-nums text-muted">{formatNumber(m.previousQuantity)} &rarr; <span className="font-semibold text-fg">{formatNumber(m.newQuantity)}</span></span> }]),
    ...(compact ? [] : [
      { key: 'reason', header: 'Reason', hideBelow: 'lg' as const, cell: (m: StockMovement) => <div className="max-w-[240px]"><p className="truncate">{m.reason}</p>{m.reference && <p className="truncate text-xs text-muted">Ref: {m.reference}</p>}</div> },
      { key: 'by', header: 'By', hideBelow: 'lg' as const, cell: (m: StockMovement) => m.creator?.fullName ?? '-' },
    ]),
  ]
  return <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} isLoading={isLoading} isError={isError} onRetry={onRetry} skeletonRows={compact ? 4 : 8} empty={{ title: 'No movements yet', description: 'Stock in, stock out and corrections will appear here.' }} />
}
