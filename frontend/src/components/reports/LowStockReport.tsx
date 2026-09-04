import React from 'react'
import { StatusBadge } from '../common/Badges/StatusBadge'
import { DataTable } from '../common/Table/DataTable'

interface LowStockReportProps {
  data?: {
    lowStock: any[]
    outOfStock: any[]
    summary: {
      totalLowStock: number
      totalOutOfStock: number
    }
  }
}

export const LowStockReport: React.FC<LowStockReportProps> = ({ data }) => {
  if (!data) {
    return <div className="text-center py-12 text-gray-500">No data available</div>
  }

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.product?.name}</div>
          <div className="text-xs text-gray-500">{item.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: any) => item.location?.name || '-',
    },
    {
      key: 'available',
      header: 'Available',
      render: (item: any) => (
        <span className="font-medium">{item.availableQuantity}</span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (item: any) => item.product?.reorderLevel || '-',
    },
    {
      key: 'shortfall',
      header: 'Shortfall',
      render: (item: any) => (
        <span className="text-red-600 font-medium">{item.shortfall}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => {
        const status = item.availableQuantity <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'
        return <StatusBadge status={status} />
      },
    },
  ]

  const allItems = [...data.lowStock, ...data.outOfStock]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-700">Low Stock Items</div>
          <div className="text-2xl font-bold text-yellow-700">{data.summary.totalLowStock}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">Out of Stock Items</div>
          <div className="text-2xl font-bold text-red-700">{data.summary.totalOutOfStock}</div>
        </div>
      </div>

      {allItems.length > 0 ? (
        <DataTable columns={columns} data={allItems} />
      ) : (
        <div className="text-center py-12 text-green-600">
          <p className="text-lg font-medium">✓ All items are well stocked!</p>
          <p className="text-sm">No low stock or out of stock items found.</p>
        </div>
      )}
    </div>
  )
}