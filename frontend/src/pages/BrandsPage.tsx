import { z } from 'zod'
import { ResourceManager } from '../components/common/ResourceManager'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { brandsApi } from '../api/endpoints/brands.api'
import { formatDate } from '../utils/format-utils'
import type { Brand } from '../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export default function BrandsPage() {
  return (
    <ResourceManager<Brand, Values>
      title="Brands" singular="Brand" queryKey="brands"
      description="The manufacturers and labels you stock."
      fetchAll={() => brandsApi.getAll()}
      create={(d) => brandsApi.create(d as never)}
      update={(id, d) => brandsApi.update(id, d as never)}
      remove={(id) => brandsApi.delete(id)}
      schema={schema}
      emptyValues={{ name: '', status: 'ACTIVE' }}
      toFormValues={(b) => ({ name: b.name, status: b.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
      fields={[
        { name: 'name', label: 'Brand name', placeholder: 'e.g. Oraimo' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
      ]}
      columns={[
        { key: 'name', header: 'Brand', cell: (b) => <span className="font-semibold">{b.name}</span> },
        { key: 'products', header: 'Products', align: 'right', cell: (b) => b._count?.products ?? 0 },
        { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
        { key: 'created', header: 'Created', hideBelow: 'md', cell: (b) => formatDate(b.createdAt) },
      ]}
      searchText={(b) => b.name}
      rowName={(b) => b.name}
      deleteMessage={(b) => (b._count?.products ?? 0) > 0
        ? `"${b.name}" has ${b._count?.products} product(s), so it will be deactivated instead of deleted.`
        : `"${b.name}" will be permanently deleted.`}
    />
  )
}
