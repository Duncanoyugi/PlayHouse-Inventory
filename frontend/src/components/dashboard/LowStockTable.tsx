export const LowStockTable = ({ data }: { data?: { lowStock: any[]; outOfStock: any[] } }) => {
  const items = data?.lowStock || data?.outOfStock || []
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Items</h3>
      {items.length === 0 ? (
        <p className="text-gray-500">No low stock items.</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.product?.name || item.productName || 'Unknown'}</p>
                <p className="text-sm text-gray-500">Available: {item.availableQuantity ?? item.quantity ?? 0}</p>
              </div>
              <span className="text-sm text-red-600 font-medium">Low</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
