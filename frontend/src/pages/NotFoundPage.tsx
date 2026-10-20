import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ROUTES } from '../routes/route-constants'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/12 text-brand-600"><Compass className="h-8 w-8" /></span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-fg">Page not found</h1>
        <p className="mt-2 text-muted">The page you are looking for does not exist or has moved.</p>
        <Link to={ROUTES.DASHBOARD} className="btn btn-primary mt-8">Back to dashboard</Link>
      </div>
    </div>
  )
}
