import React from 'react'

interface InventorySummaryProps {
  data?: {
    summary: {
      totalProducts: number
      totalUnits: number
      totalAvailable: number
      totalValue: number
      lowStockCount: number
      outOfStockCount: number
    }
    byLocation: Array<{
      locationName: string
      totalUnits: number
      totalValue: number
    }>
    byCategory: Array<{
      categoryName: string
      totalUnits: number
      totalValue: number
    }>
  }
}

export const InventorySummary: React.FC<InventorySummaryProps> = ({ data }) => {
  if (!data) {
    return <div className="text-center py-12 text-gray-500">No data available</div>
  }

  const { summary, byLocation, byCategory } = data

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-bold">{summary.totalProducts}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Units</div>
          <div className="text-2xl font-bold">{summary.totalUnits}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Available Units</div>
          <div className="text-2xl font-bold">{summary.totalAvailable}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold">KES {summary.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-yellow-200 bg-yellow-50">
          <div className="text-sm text-yellow-700">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-700">{summary.lowStockCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="text-sm text-red-700">Out of Stock</div>
          <div className="text-2xl font-bold text-red-700">{summary.outOfStockCount}</div>
        </div>
      </div>

      {/* By Location */}
      {byLocation && byLocation.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Stock by Location</h3>
          <div className="space-y-2">
            {byLocation.map((item) => (
              <div key={item.locationName} className="flex items-center">
                <span className="w-1/3 text-sm">{item.locationName}</span>
                <div className="w-1/3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{
                        width: `${(item.totalUnits / summary.totalUnits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-1/6 text-sm text-right">{item.totalUnits} units</span>
                <span className="w-1/6 text-sm text-right">KES {item.totalValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Category */}
      {byCategory && byCategory.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Stock by Category</h3>
          <div className="space-y-2">
            {byCategory.map((item) => (
              <div key={item.categoryName} className="flex items-center">
                <span className="w-1/3 text-sm">{item.categoryName}</span>
                <div className="w-1/3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{
                        width: `${(item.totalUnits / summary.totalUnits) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-1/6 text-sm text-right">{item.totalUnits} units</span>
                <span className="w-1/6 text-sm text-right">KES {item.totalValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}