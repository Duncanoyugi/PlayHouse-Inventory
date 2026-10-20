import { titleCase } from '../../../utils/format-utils'

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'gray'

const TONES: Record<string, Tone> = {
  // generic
  ACTIVE: 'green', INACTIVE: 'gray', DISCONTINUED: 'red', DISABLED: 'red',
  // purchase orders
  DRAFT: 'gray', SUBMITTED: 'blue', APPROVED: 'violet', PARTIALLY_RECEIVED: 'amber', RECEIVED: 'green', CANCELLED: 'red',
  // stock movements
  STOCK_IN: 'green', STOCK_OUT: 'blue', ADJUSTMENT: 'violet', DAMAGE: 'red', RETURN: 'amber',
}

export function StatusBadge({ status, label }: { status?: string | null; label?: string }) {
  if (!status) return null
  return <span className={`badge badge-${TONES[status] ?? 'gray'}`}>{label ?? titleCase(status)}</span>
}

export function Badge({ tone = 'gray', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
