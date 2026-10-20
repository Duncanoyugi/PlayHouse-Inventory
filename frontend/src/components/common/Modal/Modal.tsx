import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Prevent closing while a request is in flight. */
  locked?: boolean
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md', locked = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose()
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog (first field if any) for keyboard / screen reader users.
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('input:not([disabled]),select,textarea')
      ;(first ?? panelRef.current)?.focus()
    }, 30)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose, locked])

  if (!isOpen) return null

  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={clsx(
          'animate-pop relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-line bg-surface shadow-pop outline-none sm:rounded-3xl',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-fg">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
