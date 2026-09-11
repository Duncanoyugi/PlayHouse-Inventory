import type { User } from '../../types'

export const UserList = ({ users }: { users: User[] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
    <table className="min-w-full text-left text-sm">
      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th></tr></thead>
      <tbody className="divide-y divide-gray-100">{users.map((user) => <tr key={user.id}><td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td><td className="px-4 py-3 text-gray-600">{user.email}</td><td className="px-4 py-3">{user.role}</td><td className="px-4 py-3">{user.status}</td></tr>)}</tbody>
    </table>
  </div>
)
