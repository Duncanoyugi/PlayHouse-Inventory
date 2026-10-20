import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck, TriangleAlert } from 'lucide-react'
import { PageHeader } from '../components/common/PageHeader'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { SearchBar } from '../components/common/Search/SearchBar'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { Badge } from '../components/common/Badges/StatusBadge'
import { IconButton } from '../components/common/Buttons/IconButton'
import { StockActionModal } from '../components/inventory/StockActionModal'
import type { StockMode } from '../components/inventory/stock-modes'
import { inventoryApi } from '../api/endpoints/inventory.api'
import { locationsApi } from '../api/endpoints/locations.api'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatNumber } from '../utils/format-utils'
import type { InventoryBalance } from '../types'

const LEVELS = [
  { id: 'all', label: 'All stock' },
  { id: 'low', label: 'Low stock' },
  { id: 'out', label: 'Out of stock' },
] as const

export default function InventoryPage() {
  usePageTitle('Inventory')
  const { can } = usePermissions()
  const [search, setSearch] = useState('')
  const [locationId, setLocationId] = useState('')
  const [level, setLevel] = useState<'all' | 'low' | 'out'>('all')
  const [page, setPage] = useState(1)
  const [action, setAction] = useState<{ mode: StockMode; row: InventoryBalance } | null>(null)
  const limit = 15

  const locations = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll() })
  const list = useQuery({
    queryKey: ['inventory', { search, locationId, level, page }],
    queryFn: () => inventoryApi.getAll({ search: search || undefined, locationId: locationId || undefined, stockLevel: level, page, limit }),
    placeholderData: keepPreviousData,
  })

  const record = can('stock:record')
  const adjust = can('stock:adjust')

  const columns: Column<InventoryBalance>[] = [
    { key: 'product', header: 'Product', cell: (r) => <div className="min-w-[180px]"><p className="font-semibold">{r.product?.name}</p><p className="text-xs text-muted">{r.product?.sku}</p></div> },
    { key: 'location', header: 'Location', hideBelow: 'md', cell: (r) => r.location?.name },
    { key: 'qty', header: 'On hand', align: 'right', cell: (r) => <span className="font-semibold tabular-nums">{formatNumber(r.quantity)}</span> },
    { key: 'reserved', header: 'Reserved', align: 'right', hideBelow: 'lg', cell: (r) => <span className="tabular-nums text-muted">{formatNumber(r.reservedQuantity)}</span> },
    { key: 'avail', header: 'Available', align: 'right', cell: (r) => <span className="font-semibold tabular-nums">{formatNumber(r.availableQuantity)}</span> },
    {
      key: 'level', header: 'Level',
      cell: (r) => r.availableQuantity <= 0 ? <Badge tone="red">Out of stock</Badge> : r.availableQuantity <= (r.product?.reorderLevel ?? 0) ? <Badge tone="amber">Low</Badge> : <Badge tone="green">Healthy</Badge>,
    },
    ...(record ? [{
      key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right' as const,
      cell: (r: InventoryBalance) => (
        <div className="flex justify-end gap-0.5">
          <IconButton label="Record incoming" tone="brand" onClick={() => setAction({ mode: 'in', row: r })}><ArrowDownToLine className="h-4 w-4" /></IconButton>
          <IconButton label="Record outgoing" tone="brand" onClick={() => setAction({ mode: 'out', row: r })}><ArrowUpFromLine className="h-4 w-4" /></IconButton>
          {adjust && <IconButton label="Correct stock count" onClick={() => setAction({ mode: 'adjust', row: r })}><ClipboardCheck className="h-4 w-4" /></IconButton>}
          {adjust && <IconButton label="Write off damaged" tone="danger" onClick={() => setAction({ mode: 'damage', row: r })}><TriangleAlert className="h-4 w-4" /></IconButton>}
        </div>
      ),
    }] : []),
  ]

  return (
    <>
      <PageHeader title="Inventory" description="What is on the shelves right now, by product and location." />

      <section className="card overflow-hidden">
        <div className="space-y-3 border-b border-line p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search product, SKU or barcode" />
            <FormSelect aria-label="Location" placeholder="All locations" value={locationId} onChange={(e) => { setLocationId(e.target.value); setPage(1) }} options={(locations.data ?? []).map((l) => ({ value: l.id, label: l.name }))} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Stock level">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => { setLevel(l.id); setPage(1) }} aria-pressed={level === l.id}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${level === l.id ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-line text-muted hover:text-fg'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={list.data?.items ?? []}
          rowKey={(r) => r.id}
          isLoading={list.isLoading}
          isError={list.isError}
          onRetry={() => void list.refetch()}
          empty={{ title: 'No stock found', description: search || level !== 'all' || locationId ? 'Try changing your filters.' : 'Record incoming stock to see it here.' }}
        />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>

      <StockActionModal mode={action?.mode ?? null} product={action?.row.product ?? null} locationId={action?.row.locationId} onClose={() => setAction(null)} />
    </>
  )
}
