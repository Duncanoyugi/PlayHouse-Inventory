import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { clsx } from 'clsx'
import { productsApi } from '../../api/endpoints/products.api'
import { useDebounce } from '../../hooks/useDebounce'
import { formatNumber } from '../../utils/format-utils'
import type { Product } from '../../types'

interface ProductPickerProps {
  value: Product | null
  onChange: (product: Product | null) => void
  label?: string
  error?: string
  disabled?: boolean
  /** Only products that can receive new stock / be ordered. */
  activeOnly?: boolean
  excludeIds?: string[]
  placeholder?: string
}

/** Searchable product selector (name, SKU or barcode) - fast for shops with large catalogues. */
export function ProductPicker({ value, onChange, label, error, disabled, activeOnly, excludeIds = [], placeholder = 'Search product by name, SKU or barcode' }: ProductPickerProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [cursor, setCursor] = useState(0)
  const search = useDebounce(text, 250)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const { data, isFetching } = useQuery({
    queryKey: ['product-picker', search, activeOnly],
    queryFn: () => productsApi.getAll({ search: search || undefined, status: activeOnly ? 'ACTIVE' : undefined, limit: 15 }),
    enabled: open,
    staleTime: 15_000,
  })
  const options = (data?.items ?? []).filter((p) => !excludeIds.includes(p.id))

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const choose = (p: Product) => {
    onChange(p)
    setOpen(false)
    setText('')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setCursor((c) => Math.min(c + 1, options.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    else if (e.key === 'Enter' && open && options[cursor]) { e.preventDefault(); choose(options[cursor]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      {label && <label className="label">{label}</label>}
      {value && !open ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={clsx('input flex items-center justify-between gap-3 text-left', error && 'input-error')}
        >
          <span className="min-w-0">
            <span className="block truncate font-medium">{value.name}</span>
            <span className="block truncate text-xs text-muted">{value.sku}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={text}
            disabled={disabled}
            autoFocus={open}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setText(e.target.value); setOpen(true); setCursor(0) }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={clsx('input pl-10', error && 'input-error')}
            autoComplete="off"
          />
        </div>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="animate-pop absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-surface p-1.5 shadow-pop"
        >
          {isFetching && options.length === 0 && (
            <li className="flex items-center gap-2 px-3 py-3 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Searching...</li>
          )}
          {!isFetching && options.length === 0 && <li className="px-3 py-3 text-sm text-muted">No matching products</li>}
          {options.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={value?.id === p.id}
              onMouseEnter={() => setCursor(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(p) }}
              className={clsx('flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5', i === cursor && 'bg-brand-500/10')}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-fg">{p.name}</span>
                <span className="block truncate text-xs text-muted">{p.sku}{p.brand ? ` - ${p.brand.name}` : ''}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                {p.availableQuantity !== undefined && <span>{formatNumber(p.availableQuantity)} in stock</span>}
                {value?.id === p.id && <Check className="h-4 w-4 text-brand-600" />}
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
