import { CloudOff } from 'lucide-react'
import { Button } from './Buttons/Button'

export function ErrorState({ message = 'We could not load this data.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <CloudOff className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-fg">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && <Button className="mt-5" variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  )
}
