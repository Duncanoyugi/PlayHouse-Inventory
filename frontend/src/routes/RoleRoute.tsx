import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from './route-constants'

export const RoleRoute = ({ role }: { role: 'ADMIN' | 'STOREKEEPER' }) => {
  const { user } = useAuth()
  return user?.role === role ? <Outlet /> : <Navigate to={ROUTES.UNAUTHORIZED} replace />
}