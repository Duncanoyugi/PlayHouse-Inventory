const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const compact = new Intl.NumberFormat('en-KE', { notation: 'compact', maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat('en-KE')

export const toNumber = (value: unknown): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const formatMoney = (value: unknown) => money.format(toNumber(value))
export const formatCompactMoney = (value: unknown) => `KES ${compact.format(toNumber(value))}`
export const formatNumber = (value: unknown) => plain.format(toNumber(value))

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (value?: string | Date | null) => {
  if (!value) return '-'
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hr ago`
  if (seconds < 86400 * 7) return `${Math.round(seconds / 86400)} day${Math.round(seconds / 86400) === 1 ? '' : 's'} ago`
  return formatDate(value)
}

/** STOCK_IN -> Stock In */
export const titleCase = (value?: string | null) =>
  (value ?? '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

export const initials = (name?: string | null) =>
  (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('') || '?'

export const toIsoDateStart = (date?: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined)
export const toIsoDateEnd = (date?: string) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined)

/** Remove empty strings / undefined so optional API fields are omitted instead of failing validation. */
export const compactObject = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  ) as Partial<T>
