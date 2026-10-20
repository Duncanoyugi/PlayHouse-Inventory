import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ label = 'Loading...', fullPage = false }: { label?: string; fullPage?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-screen' : 'py-16'}`} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

export default LoadingSpinner
