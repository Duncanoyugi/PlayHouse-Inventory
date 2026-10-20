import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../../hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Debounced search box: typing is instant, the parent only hears about it after a pause. */
export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  const [text, setText] = useState(value)
  const debounced = useDebounce(text, 350)

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <label className={`relative block ${className ?? ''}`}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-9"
        type="search"
        autoComplete="off"
      />
      {text && (
        <button
          type="button"
          onClick={() => { setText(''); onChange('') }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  )
}
