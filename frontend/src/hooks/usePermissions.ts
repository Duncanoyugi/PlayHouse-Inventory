import { useAuth } from '../contexts/AuthContext'
import { hasPermission, type Permission } from '../constants/permissions'

export function usePermissions() {
  const { user } = useAuth()
  return {
    role: user?.role,
    isManager: user?.role === 'ADMIN',
    isStorekeeper: user?.role === 'STOREKEEPER',
    can: (permission: Permission) => hasPermission(user?.role, permission),
  }
}
