import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ROUTES } from '../routes/route-constants'
import { usePageTitle } from '../hooks/usePageTitle'

export default function UnauthorizedPage() {
  usePageTitle('Access restricted')
  return (
    <div className="card card-pad mx-auto mt-10 max-w-lg text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/14 text-amber-600"><Lock className="h-7 w-7" /></span>
      <h1 className="mt-5 text-2xl font-bold text-fg">Manager access only</h1>
      <p className="mt-2 text-sm text-muted">Your account is not allowed to open this page. If you need access, ask the store manager.</p>
      <Link to={ROUTES.DASHBOARD} className="btn btn-primary mt-6">Back to dashboard</Link>
    </div>
  )
}
