import type { Role } from '../../../types'
import { ROLE_LABEL } from '../../../constants/roles'

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`badge ${role === 'ADMIN' ? 'badge-violet' : 'badge-blue'}`}>{ROLE_LABEL[role]}</span>
}
