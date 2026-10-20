import { Navigate, Outlet } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import type { Permission } from '../constants/permissions'
import { ROUTES } from './route-constants'

/** Blocks a whole route group unless the signed-in role holds the permission. */
export function RoleRoute({ permission }: { permission: Permission }) {
  const { can } = usePermissions()
  if (!can(permission)) return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  return <Outlet />
}
