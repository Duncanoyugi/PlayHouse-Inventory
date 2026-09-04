import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../api/endpoints/audit.api'
import { ActivityTable } from '../components/common/ActivityTable'
import LoadingSpinner from '../components/common/Loading/LoadingSpinner'

export const AuditPage = () => {
  const query = useQuery({ queryKey: ['audit'], queryFn: () => auditApi.getAll({ page: 1, limit: 100 }) })
  if (query.isLoading) return <LoadingSpinner />
  const rows = query.data?.items || []
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Governance</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Audit log</h1><p className="mt-2 text-sm text-slate-500">A tamper-evident operational trail for administrative review.</p></div><ActivityTable title="Recorded actions" description={`${query.data?.total || rows.length} audit events`} rows={rows} onRefresh={() => void query.refetch()} columns={[{ key: 'createdAt', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleString() }, { key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'user', label: 'Actor', render: (row) => row.user?.fullName || row.userId }, { key: 'newValue', label: 'Details', render: (row) => <code className="block max-w-xs truncate text-xs text-slate-500">{JSON.stringify(row.newValue)}</code> }]} /></div>
}
