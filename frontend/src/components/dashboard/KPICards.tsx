import React from 'react'
import { StatCard } from '../common/Cards/StatCard'
import { Package, Box, AlertTriangle, TrendingUp } from 'lucide-react'

interface KPICardsProps {
  data?: {
    summary?: {
      totalProducts: number
      totalUnits: number
      totalAvailable: number
      totalValue: number
      lowStockCount: number
      outOfStockCount: number
    }
  }
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const summary = data?.summary || {
    totalProducts: 0,
    totalUnits: 0,
    totalAvailable: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={summary.totalProducts}
        icon={Package}
        color="blue"
      />
      <StatCard
        title="Total Units"
        value={summary.totalUnits}
        icon={Box}
        color="green"
      />
      <StatCard
        title="Inventory Value"
        value={`KES ${summary.totalValue.toLocaleString()}`}
        icon={TrendingUp}
        color="purple"
      />
      <StatCard
        title="Low Stock Items"
        value={summary.lowStockCount + summary.outOfStockCount}
        icon={AlertTriangle}
        color="red"
        subtitle={`${summary.lowStockCount} low, ${summary.outOfStockCount} out of stock`}
      />
    </div>
  )
}