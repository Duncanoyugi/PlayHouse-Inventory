import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowRight, Banknote, Boxes, PackageCheck, PackageX, ShoppingCart, Activity } from 'lucide-react'
import { reportsApi } from '../api/endpoints/reports.api'
import { inventoryApi } from '../api/endpoints/inventory.api'
import { stockMovementsApi } from '../api/endpoints/stock-movements.api'
import { purchaseOrdersApi } from '../api/endpoints/purchase-orders.api'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/Cards/StatCard'
import { MovementTable } from '../components/stock-movements/MovementTable'
import { Badge } from '../components/common/Badges/StatusBadge'
import { EmptyState } from '../components/common/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTitle } from '../hooks/usePageTitle'
import { ROUTES } from '../routes/route-constants'
import { formatCompactMoney, formatNumber } from '../utils/format-utils'

function QuickAction({ to, icon: Icon, title, text, tone }: { to: string; icon: typeof Boxes; title: string; text: string; tone: string }) {
  return (
    <Link to={to} className="card card-pad group flex items-center gap-4 transition hover:-translate-y-0.5 hover:border-brand-500/40">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
      <span className="min-w-0 flex-1"><span className="block font-semibold text-fg">{title}</span><span className="block text-sm text-muted">{text}</span></span>
      <ArrowRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-brand-600" />
    </Link>
  )
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const { can, isManager } = usePermissions()
  const today = new Date().toISOString().slice(0, 10)

  const lowStock = useQuery({ queryKey: ['dashboard', 'low-stock'], queryFn: () => inventoryApi.getLowStock() })
  const movements = useQuery({ queryKey: ['dashboard', 'movements'], queryFn: () => stockMovementsApi.getAll({ limit: 8 }) })
  const todayMoves = useQuery({ queryKey: ['dashboard', 'today'], queryFn: () => stockMovementsApi.getAll({ fromDate: today, limit: 1 }) })
  const summary = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: () => reportsApi.getInventorySummary(), enabled: can('report:view') })
  const stockLines = useQuery({ queryKey: ['dashboard', 'lines'], queryFn: () => inventoryApi.getAll({ limit: 1 }) })
  const submitted = useQuery({ queryKey: ['dashboard', 'po-submitted'], queryFn: () => purchaseOrdersApi.getAll({ status: 'SUBMITTED', limit: 1 }), enabled: can('po:manage') })
  const approved = useQuery({ queryKey: ['dashboard', 'po-approved'], queryFn: () => purchaseOrdersApi.getAll({ status: 'APPROVED', limit: 1 }), enabled: can('receipt:create') })

  const low = lowStock.data?.lowStock ?? []
  const out = lowStock.data?.outOfStock ?? []
  const attention = [...out, ...low].slice(0, 6)

  return (
    <>
      <PageHeader eyebrow={isManager ? 'Manager overview' : 'Store overview'} title={`Hello, ${user?.fullName.split(' ')[0]}`} description={isManager ? "Here is how the shop's stock looks right now." : 'Record what comes in and goes out, and keep an eye on what is running low.'} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isManager ? (
          <>
            <StatCard label="Stock value (at cost)" value={formatCompactMoney(summary.data?.summary.totalValue)} icon={<Banknote className="h-5 w-5" />} tone="green" isLoading={summary.isLoading} />
            <StatCard label="Units on hand" value={formatNumber(summary.data?.summary.totalUnits)} hint={`${formatNumber(summary.data?.summary.totalProducts)} products`} icon={<Boxes className="h-5 w-5" />} isLoading={summary.isLoading} />
          </>
        ) : (
          <>
            <StatCard label="Stock lines" value={formatNumber(stockLines.data?.total)} hint="Products on the shelves" icon={<Boxes className="h-5 w-5" />} isLoading={stockLines.isLoading} />
            <StatCard label="Recorded today" value={formatNumber(todayMoves.data?.total)} hint="Movements entered today" icon={<Activity className="h-5 w-5" />} tone="violet" isLoading={todayMoves.isLoading} />
          </>
        )}
        <StatCard label="Low stock" value={formatNumber(low.length)} hint="Need reordering soon" icon={<AlertTriangle className="h-5 w-5" />} tone="amber" isLoading={lowStock.isLoading} />
        <StatCard label="Out of stock" value={formatNumber(out.length)} hint="Cannot be sold" icon={<PackageX className="h-5 w-5" />} tone="red" isLoading={lowStock.isLoading} />
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {can('stock:record') && <QuickAction to={ROUTES.STOCK_DESK} icon={ArrowDownToLine} title="Record incoming stock" text="Deliveries, returns, transfers in" tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-300" />}
        {can('stock:record') && <QuickAction to={ROUTES.STOCK_DESK} icon={ArrowUpFromLine} title="Record outgoing stock" text="Sales, transfers, internal use" tone="bg-sky-500/12 text-sky-600 dark:text-sky-300" />}
        {can('receipt:create') && <QuickAction to={ROUTES.GOODS_RECEIPTS} icon={PackageCheck} title="Receive a delivery" text={`${formatNumber(approved.data?.total ?? 0)} approved order(s) waiting`} tone="bg-amber-500/14 text-amber-600 dark:text-amber-300" />}
        {can('po:manage') && <QuickAction to={ROUTES.PURCHASE_ORDERS} icon={ShoppingCart} title="Purchase orders" text={`${formatNumber(submitted.data?.total ?? 0)} waiting for approval`} tone="bg-violet-500/12 text-violet-600 dark:text-violet-300" />}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card overflow-hidden xl:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold">Recent movements</h2>
            <Link to={ROUTES.STOCK_MOVEMENTS} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">View all</Link>
          </div>
          <MovementTable rows={movements.data?.items ?? []} isLoading={movements.isLoading} isError={movements.isError} onRetry={() => void movements.refetch()} compact />
        </section>

        <section className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold">Needs attention</h2>
            <Link to={ROUTES.INVENTORY} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Inventory</Link>
          </div>
          {lowStock.isLoading ? <div className="space-y-3 p-5">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
            : attention.length === 0 ? <EmptyState icon={<PackageCheck className="h-6 w-6" />} title="All stocked up" description="Nothing is running low right now." />
            : (
              <ul className="divide-y divide-line">
                {attention.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{i.product?.name}</p><p className="truncate text-xs text-muted">{i.location?.name} - reorder at {formatNumber(i.reorderLevel)}</p></div>
                    <Badge tone={i.availableQuantity <= 0 ? 'red' : 'amber'}>{i.availableQuantity <= 0 ? 'Out' : `${formatNumber(i.availableQuantity)} left`}</Badge>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </>
  )
}
