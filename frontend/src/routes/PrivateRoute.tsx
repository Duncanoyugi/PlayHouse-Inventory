import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/Loading/LoadingSpinner'
import { ROUTES } from './route-constants'

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner fullPage label="Restoring your session..." />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  return <Outlet />
}
