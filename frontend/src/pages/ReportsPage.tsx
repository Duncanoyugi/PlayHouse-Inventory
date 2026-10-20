import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Banknote, Boxes, Download, AlertTriangle, PackageX } from 'lucide-react'
import { reportsApi } from '../api/endpoints/reports.api'
import { locationsApi } from '../api/endpoints/locations.api'
import { PageHeader } from '../components/common/PageHeader'
import { Tabs } from '../components/common/Tabs/Tabs'
import { StatCard } from '../components/common/Cards/StatCard'
import { BarList } from '../components/common/Cards/BarList'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Button } from '../components/common/Buttons/Button'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { FormInput } from '../components/common/Forms/FormInput'
import { Badge, StatusBadge } from '../components/common/Badges/StatusBadge'
import { ErrorState } from '../components/common/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { downloadCsv } from '../utils/export-utils'
import { formatCompactMoney, formatDateTime, formatMoney, formatNumber, titleCase } from '../utils/format-utils'
import type { LowStockItem, MovementReport, ValuationReport, TopMovingReport } from '../types'

type Tab = 'summary' | 'low' | 'valuation' | 'movements' | 'top'
const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Summary' }, { id: 'low', label: 'Low stock' }, { id: 'valuation', label: 'Valuation' },
  { id: 'movements', label: 'Movements' }, { id: 'top', label: 'Top moving' },
]

const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4"><h2 className="text-base font-semibold">{title}</h2>{action}</div>{children}</section>
)

export default function ReportsPage() {
  usePageTitle('Reports')
  const [tab, setTab] = useState<Tab>('summary')
  const [locationId, setLocationId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [period, setPeriod] = useState('30')
  const loc = locationId || undefined

  const locations = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll() })
  const summary = useQuery({ queryKey: ['reports', 'summary', loc], queryFn: () => reportsApi.getInventorySummary(loc), enabled: tab === 'summary' })
  const low = useQuery({ queryKey: ['reports', 'low', loc], queryFn: () => reportsApi.getLowStockReport(loc), enabled: tab === 'low' })
  const valuation = useQuery({ queryKey: ['reports', 'valuation', loc], queryFn: () => reportsApi.getValuationReport(loc), enabled: tab === 'valuation' })
  const movements = useQuery({ queryKey: ['reports', 'movements', loc, fromDate, toDate], queryFn: () => reportsApi.getMovementReport({ locationId: loc, fromDate: fromDate || undefined, toDate: toDate || undefined }), enabled: tab === 'movements' })
  const top = useQuery({ queryKey: ['reports', 'top', period], queryFn: () => reportsApi.getTopMovingProducts(10, Number(period)), enabled: tab === 'top' })

  const lowColumns: Column<LowStockItem>[] = [
    { key: 'p', header: 'Product', cell: (i) => <div><p className="font-semibold">{i.product?.name}</p><p className="text-xs text-muted">{i.product?.sku}</p></div> },
    { key: 'l', header: 'Location', hideBelow: 'md', cell: (i) => i.location?.name },
    { key: 'a', header: 'Available', align: 'right', cell: (i) => formatNumber(i.availableQuantity) },
    { key: 'r', header: 'Reorder at', align: 'right', cell: (i) => formatNumber(i.reorderLevel) },
    { key: 's', header: 'Shortfall', align: 'right', cell: (i) => <Badge tone={i.availableQuantity <= 0 ? 'red' : 'amber'}>{formatNumber(Math.max(0, i.shortfall))}</Badge> },
  ]
  const valCols: Column<ValuationReport['items'][number]>[] = [
    { key: 'p', header: 'Product', cell: (i) => <div><p className="font-semibold">{i.product.name}</p><p className="text-xs text-muted">{i.product.sku}</p></div> },
    { key: 'l', header: 'Location', hideBelow: 'md', cell: (i) => i.location.name },
    { key: 'q', header: 'Units', align: 'right', cell: (i) => formatNumber(i.quantity) },
    { key: 'c', header: 'Unit cost', align: 'right', hideBelow: 'sm', cell: (i) => formatMoney(i.costPrice) },
    { key: 'v', header: 'Value', align: 'right', cell: (i) => <span className="font-semibold tabular-nums">{formatMoney(i.totalValue)}</span> },
  ]
  const moveCols: Column<MovementReport['movements'][number]>[] = [
    { key: 'w', header: 'When', cell: (m) => <span className="whitespace-nowrap text-muted">{formatDateTime(m.createdAt)}</span> },
    { key: 'p', header: 'Product', cell: (m) => m.product?.name },
    { key: 't', header: 'Type', cell: (m) => <StatusBadge status={m.type} /> },
    { key: 'q', header: 'Qty', align: 'right', cell: (m) => formatNumber(m.quantity) },
    { key: 'r', header: 'Reason', hideBelow: 'lg', cell: (m) => <span className="line-clamp-1">{m.reason}</span> },
    { key: 'u', header: 'By', hideBelow: 'md', cell: (m) => m.creator?.fullName },
  ]
  const topCols: Column<TopMovingReport['results'][number]>[] = [
    { key: 'p', header: 'Product', cell: (i) => <div><p className="font-semibold">{i.product.name}</p><p className="text-xs text-muted">{i.product.sku}</p></div> },
    { key: 'q', header: 'Units moved', align: 'right', cell: (i) => <span className="font-semibold tabular-nums">{formatNumber(i.totalQuantity)}</span> },
    { key: 'm', header: 'Movements', align: 'right', hideBelow: 'sm', cell: (i) => formatNumber(i.movementCount) },
    { key: 'v', header: 'Value', align: 'right', hideBelow: 'md', cell: (i) => formatMoney(i.totalValue) },
  ]

  const showLocation = tab !== 'top'
  const failed = (q: { isError: boolean; refetch: () => unknown }) => q.isError ? <ErrorState onRetry={() => void q.refetch()} /> : null

  return (
    <>
      <PageHeader title="Reports" description="Stock position, valuation and movement analysis. Exports open in Excel." />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="flex flex-wrap gap-3">
          {showLocation && <div className="w-48"><FormSelect aria-label="Location" placeholder="All locations" value={locationId} onChange={(e) => setLocationId(e.target.value)} options={(locations.data ?? []).map((l) => ({ value: l.id, label: l.name }))} /></div>}
          {tab === 'movements' && <>
            <div className="w-40"><FormInput aria-label="From date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} /></div>
            <div className="w-40"><FormInput aria-label="To date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} /></div>
          </>}
          {tab === 'top' && <div className="w-44"><FormSelect aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)} options={[{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }, { value: '365', label: 'Last 12 months' }]} /></div>}
        </div>
      </div>

      {tab === 'summary' && (failed(summary) ?? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Stock value" value={formatCompactMoney(summary.data?.summary.totalValue)} icon={<Banknote className="h-5 w-5" />} tone="green" isLoading={summary.isLoading} />
            <StatCard label="Units on hand" value={formatNumber(summary.data?.summary.totalUnits)} hint={`${formatNumber(summary.data?.summary.totalReserved)} reserved`} icon={<Boxes className="h-5 w-5" />} isLoading={summary.isLoading} />
            <StatCard label="Low stock" value={formatNumber(summary.data?.summary.lowStockCount)} icon={<AlertTriangle className="h-5 w-5" />} tone="amber" isLoading={summary.isLoading} />
            <StatCard label="Out of stock" value={formatNumber(summary.data?.summary.outOfStockCount)} icon={<PackageX className="h-5 w-5" />} tone="red" isLoading={summary.isLoading} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Section title="Value by location"><div className="p-5"><BarList items={(summary.data?.byLocation ?? []).map((l) => ({ label: l.locationName, value: l.totalValue }))} format={formatCompactMoney} /></div></Section>
            <Section title="Value by category"><div className="p-5"><BarList items={(summary.data?.byCategory ?? []).sort((a, b) => b.totalValue - a.totalValue).map((c) => ({ label: c.categoryName, value: c.totalValue }))} format={formatCompactMoney} /></div></Section>
          </div>
        </>
      ))}

      {tab === 'low' && (failed(low) ?? (
        <Section title={`Items to reorder (${formatNumber((low.data?.lowStock.length ?? 0) + (low.data?.outOfStock.length ?? 0))})`}
          action={<Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} disabled={!low.data} onClick={() => low.data && downloadCsv('low-stock', ['Product', 'SKU', 'Location', 'Available', 'Reorder level', 'Shortfall'], [...low.data.outOfStock, ...low.data.lowStock].map((i) => [i.product?.name, i.product?.sku, i.location?.name, i.availableQuantity, i.reorderLevel, Math.max(0, i.shortfall)]))}>Export CSV</Button>}>
          <DataTable columns={lowColumns} rows={[...(low.data?.outOfStock ?? []), ...(low.data?.lowStock ?? [])]} rowKey={(i) => i.id} isLoading={low.isLoading} empty={{ title: 'Everything is well stocked' }} />
        </Section>
      ))}

      {tab === 'valuation' && (failed(valuation) ?? (
        <Section title={`Valuation - ${formatMoney(valuation.data?.summary.totalValue)}`}
          action={<Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} disabled={!valuation.data} onClick={() => valuation.data && downloadCsv('valuation', ['Product', 'SKU', 'Location', 'Units', 'Unit cost', 'Value'], valuation.data.items.map((i) => [i.product.name, i.product.sku, i.location.name, i.quantity, Number(i.costPrice), i.totalValue]))}>Export CSV</Button>}>
          <DataTable columns={valCols} rows={valuation.data?.items ?? []} rowKey={(i) => `${i.product.id}-${i.location.id}`} isLoading={valuation.isLoading} empty={{ title: 'No stock to value yet' }} />
        </Section>
      ))}

      {tab === 'movements' && (failed(movements) ?? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Units in" value={formatNumber(movements.data?.summary.totalStockIn)} tone="green" isLoading={movements.isLoading} />
            <StatCard label="Units out" value={formatNumber(movements.data?.summary.totalStockOut)} tone="brand" isLoading={movements.isLoading} />
            <StatCard label="Net change" value={formatNumber(movements.data?.summary.netChange)} tone="violet" isLoading={movements.isLoading} />
          </div>
          <Section title={`Movements (${formatNumber(movements.data?.summary.totalMovements)})`}
            action={<Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} disabled={!movements.data} onClick={() => movements.data && downloadCsv('movements', ['Date', 'Product', 'SKU', 'Type', 'Quantity', 'Before', 'After', 'Reason', 'Reference', 'By'], movements.data.movements.map((m) => [m.createdAt, m.product?.name, m.product?.sku, titleCase(m.type), m.quantity, m.previousQuantity, m.newQuantity, m.reason, m.reference, m.creator?.fullName]))}>Export CSV</Button>}>
            {movements.data?.truncated && <p className="border-b border-line bg-amber-500/10 px-5 py-2.5 text-sm text-amber-700 dark:text-amber-300">Showing the latest 5,000 movements. Narrow the date range to see the rest.</p>}
            <DataTable columns={moveCols} rows={(movements.data?.movements ?? []).slice(0, 200)} rowKey={(m) => m.id} isLoading={movements.isLoading} empty={{ title: 'No movements in this period' }} />
            {(movements.data?.movements.length ?? 0) > 200 && <p className="px-5 py-3 text-sm text-muted">Showing the first 200 on screen. Export the CSV for the full list.</p>}
          </Section>
        </>
      ))}

      {tab === 'top' && (failed(top) ?? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2"><Section title="Units moved"><div className="p-5"><BarList items={(top.data?.results ?? []).map((r) => ({ label: r.product.name, value: r.totalQuantity }))} /></div></Section></div>
          <div className="lg:col-span-3"><Section title={`Top ${top.data?.results.length ?? 0} products - ${top.data?.period ?? ''}`}><DataTable columns={topCols} rows={top.data?.results ?? []} rowKey={(i) => i.product.id} isLoading={top.isLoading} empty={{ title: 'No sales activity in this period' }} /></Section></div>
        </div>
      ))}
    </>
  )
}
