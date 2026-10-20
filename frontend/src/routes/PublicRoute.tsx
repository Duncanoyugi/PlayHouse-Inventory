import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/Loading/LoadingSpinner'
import { ROUTES } from './route-constants'

/** Login page: signed-in users are sent straight to their dashboard. */
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner fullPage />
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}
