import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { purchaseOrdersApi } from '../api/endpoints/purchase-orders.api'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Buttons/Button'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { SearchBar } from '../components/common/Search/SearchBar'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { PurchaseOrderForm } from '../components/purchase-orders/PurchaseOrderForm'
import { PurchaseOrderDetail } from '../components/purchase-orders/PurchaseOrderDetail'
import { PO_STATUSES } from '../constants/statuses'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate, formatMoney, titleCase } from '../utils/format-utils'
import type { PurchaseOrder, PurchaseOrderStatus } from '../types'

export default function PurchaseOrdersPage() {
  usePageTitle('Purchase orders')
  const { can } = usePermissions()
  const manage = can('po:manage')
  const showCost = can('cost:view')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | PurchaseOrderStatus>('')
  const [page, setPage] = useState(1)
  const [viewId, setViewId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseOrder | null>(null)
  const limit = 15

  const list = useQuery({
    queryKey: ['purchase-orders', 'list', { search, status, page }],
    queryFn: () => purchaseOrdersApi.getAll({ search: search || undefined, status: status || undefined, page, limit }),
    placeholderData: keepPreviousData,
  })

  const columns: Column<PurchaseOrder>[] = [
    { key: 'po', header: 'PO number', cell: (p) => <span className="font-semibold">{p.poNumber}</span> },
    { key: 'supplier', header: 'Supplier', cell: (p) => p.supplier?.name ?? '-' },
    { key: 'date', header: 'Ordered', hideBelow: 'md', cell: (p) => formatDate(p.orderDate) },
    { key: 'expected', header: 'Expected', hideBelow: 'lg', cell: (p) => formatDate(p.expectedDate) },
    { key: 'items', header: 'Lines', align: 'right', hideBelow: 'sm', cell: (p) => p._count?.items ?? 0 },
    ...(showCost ? [{ key: 'total', header: 'Total', align: 'right' as const, cell: (p: PurchaseOrder) => <span className="font-semibold tabular-nums">{formatMoney(p.totalAmount)}</span> }] : []),
    { key: 'status', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
  ]

  const openNew = () => { setEditing(null); setFormOpen(true) }

  return (
    <>
      <PageHeader
        title="Purchase orders"
        description={manage ? 'Order stock from suppliers: draft, submit, approve, then receive.' : 'Orders placed by the manager. Open an approved order to receive its delivery.'}
        actions={manage && <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>New purchase order</Button>}
      />
      <section className="card overflow-hidden">
        <div className="space-y-3 border-b border-line p-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by PO number" className="max-w-sm" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
            {(['', ...PO_STATUSES] as const).map((s) => (
              <button key={s || 'all'} aria-pressed={status === s} onClick={() => { setStatus(s as '' | PurchaseOrderStatus); setPage(1) }}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${status === s ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-line text-muted hover:text-fg'}`}>
                {s ? titleCase(s) : 'All'}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns} rows={list.data?.items ?? []} rowKey={(p) => p.id}
          isLoading={list.isLoading} isError={list.isError} onRetry={() => void list.refetch()}
          onRowClick={(p) => setViewId(p.id)}
          empty={{ title: 'No purchase orders', description: manage ? 'Create your first purchase order to restock.' : 'Nothing has been ordered yet.', action: manage ? <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>New purchase order</Button> : undefined }}
        />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>

      <PurchaseOrderDetail id={viewId} onClose={() => setViewId(null)} onEdit={(po) => { setViewId(null); setEditing(po); setFormOpen(true) }} />
      <PurchaseOrderForm isOpen={formOpen} order={editing} onClose={() => setFormOpen(false)} />
    </>
  )
}
