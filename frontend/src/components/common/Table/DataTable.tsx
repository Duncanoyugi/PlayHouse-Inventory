import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { SearchX } from 'lucide-react'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  /** Hide on small screens to keep the table readable. */
  hideBelow?: 'sm' | 'md' | 'lg'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onRowClick?: (row: T) => void
  skeletonRows?: number
  empty?: { title: string; description?: string; action?: ReactNode }
}

const hide = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }
const align = { left: 'text-left', right: 'text-right', center: 'text-center' }

export function DataTable<T>({
  columns, rows, rowKey, isLoading, isError, onRetry, onRowClick, skeletonRows = 6, empty,
}: DataTableProps<T>) {
  if (isError) return <ErrorState onRetry={onRetry} />

  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-6 w-6" />}
        title={empty?.title ?? 'Nothing here yet'}
        description={empty?.description}
        action={empty?.action}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line">
        <thead className="bg-surface-2/60">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={clsx('th', align[c.align ?? 'left'], c.hideBelow && hide[c.hideBelow], c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className={clsx('td', c.hideBelow && hide[c.hideBelow])}>
                      <div className="skeleton h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx('transition-colors hover:bg-surface-2/60', onRowClick && 'cursor-pointer')}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={clsx('td', align[c.align ?? 'left'], c.hideBelow && hide[c.hideBelow], c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
