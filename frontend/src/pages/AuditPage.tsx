import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { auditApi } from '../api/endpoints/audit.api'
import { PageHeader } from '../components/common/PageHeader'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { FormInput } from '../components/common/Forms/FormInput'
import { IconButton } from '../components/common/Buttons/IconButton'
import { Modal } from '../components/common/Modal/Modal'
import { Badge } from '../components/common/Badges/StatusBadge'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDateTime, titleCase } from '../utils/format-utils'
import type { AuditLog } from '../types'

const ENTITIES = ['InventoryBalance', 'PurchaseOrder', 'GoodsReceipt', 'User']
const tone = (a: string) => a.includes('DELETE') || a.includes('CANCEL') || a.includes('DISABLE') || a === 'DAMAGE' ? 'red' : a.includes('CREATE') || a === 'STOCK_IN' || a === 'GOODS_RECEIVE' || a.includes('ENABLE') ? 'green' : a === 'LOGIN' ? 'gray' : 'blue'

export default function AuditPage() {
  usePageTitle('Audit log')
  const [entity, setEntity] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<AuditLog | null>(null)
  const limit = 20

  const list = useQuery({
    queryKey: ['audit', { entity, fromDate, toDate, page }],
    queryFn: () => auditApi.getAll({ entity: entity || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined, page, limit }),
    placeholderData: keepPreviousData,
  })

  const columns: Column<AuditLog>[] = [
    { key: 'w', header: 'When', cell: (l) => <span className="whitespace-nowrap text-muted">{formatDateTime(l.createdAt)}</span> },
    { key: 'u', header: 'User', cell: (l) => <div><p className="font-semibold">{l.user?.fullName ?? '-'}</p><p className="text-xs text-muted">{l.user?.email}</p></div> },
    { key: 'a', header: 'Action', cell: (l) => <Badge tone={tone(l.action)}>{titleCase(l.action)}</Badge> },
    { key: 'e', header: 'Record', hideBelow: 'md', cell: (l) => l.entity },
    { key: 'v', header: <span className="sr-only">Details</span>, align: 'right', cell: (l) => (l.newValue || l.oldValue) ? <IconButton label="View details" tone="brand" onClick={() => setView(l)}><Eye className="h-4 w-4" /></IconButton> : null },
  ]

  return (
    <>
      <PageHeader title="Audit log" description="Who did what, and when. Entries cannot be edited or removed." />
      <section className="card overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-3">
          <FormSelect aria-label="Record type" placeholder="All records" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1) }} options={ENTITIES.map((e) => ({ value: e, label: e }))} />
          <FormInput aria-label="From date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} />
          <FormInput aria-label="To date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
        </div>
        <DataTable columns={columns} rows={list.data?.items ?? []} rowKey={(l) => l.id} isLoading={list.isLoading} isError={list.isError} onRetry={() => void list.refetch()} empty={{ title: 'No activity recorded' }} />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>
      <Modal isOpen={!!view} onClose={() => setView(null)} size="lg" title={view ? titleCase(view.action) : ''} description={view ? `${view.user?.fullName} - ${formatDateTime(view.createdAt)}` : undefined}>
        {view && (
          <div className="space-y-4">
            {view.oldValue != null && <div><p className="mb-1 text-sm font-semibold">Before</p><pre className="overflow-x-auto rounded-xl bg-surface-2 p-4 text-xs">{JSON.stringify(view.oldValue, null, 2)}</pre></div>}
            {view.newValue != null && <div><p className="mb-1 text-sm font-semibold">Details</p><pre className="overflow-x-auto rounded-xl bg-surface-2 p-4 text-xs">{JSON.stringify(view.newValue, null, 2)}</pre></div>}
          </div>
        )}
      </Modal>
    </>
  )
}
