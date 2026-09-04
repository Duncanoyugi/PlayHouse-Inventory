import React from 'react'
import { DataTable } from '../common/Table/DataTable'
import LoadingSpinner from '../common/Loading/LoadingSpinner'

interface ValuationReportProps {
  data?: {
    items: any[]
    summary: {
      totalItems: number
      totalUnits: number
      totalAvailable: number
      totalValue: number
      totalAvailableValue: number
    }
  }
  isLoading: boolean
}

export const ValuationReport: React.FC<ValuationReportProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

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
      key: 'quantity',
      header: 'Quantity',
      render: (item: any) => item.quantity,
    },
    {
      key: 'available',
      header: 'Available',
      render: (item: any) => item.availableQuantity,
    },
    {
      key: 'costPrice',
      header: 'Cost Price',
      render: (item: any) => `KES ${item.costPrice.toLocaleString()}`,
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      render: (item: any) => `KES ${item.totalValue.toLocaleString()}`,
    },
    {
      key: 'availableValue',
      header: 'Available Value',
      render: (item: any) => `KES ${item.availableValue.toLocaleString()}`,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold">{data.summary.totalItems}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Units</div>
          <div className="text-2xl font-bold">{data.summary.totalUnits}</div>
        </div>
        <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
          <div className="text-sm text-primary-700">Inventory Value</div>
          <div className="text-2xl font-bold text-primary-700">KES {data.summary.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">Available Value</div>
          <div className="text-2xl font-bold text-green-700">KES {data.summary.totalAvailableValue.toLocaleString()}</div>
        </div>
      </div>

      <DataTable columns={columns} data={data.items} />
    </div>
  )
}