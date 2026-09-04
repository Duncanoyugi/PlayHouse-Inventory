import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/endpoints/reports.api'
import { inventoryApi } from '../api/endpoints/inventory.api'
import { KPICards } from '../components/dashboard/KPICards'
import { LowStockTable } from '../components/dashboard/LowStockTable'
import { RecentMovements } from '../components/dashboard/RecentMovements'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'

export const DashboardPage = () => {
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => reportsApi.getInventorySummary(),
  })

  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.getLowStock(),
  })

  if (summaryLoading || lowStockLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <KPICards data={summaryData as any} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockTable data={lowStockData as any} />
        <RecentMovements />
      </div>
    </div>
  )
}