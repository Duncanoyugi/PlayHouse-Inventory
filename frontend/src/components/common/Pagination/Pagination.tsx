import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../Buttons/Button'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-fg">{from}-{to}</span> of <span className="font-semibold text-fg">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} icon={<ChevronLeft className="h-4 w-4" />}>
          Prev
        </Button>
        <span className="px-2 text-sm text-muted">Page {page} of {Math.max(totalPages, 1)}</span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
