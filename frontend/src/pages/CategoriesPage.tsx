import { z } from 'zod'
import { ResourceManager } from '../components/common/ResourceManager'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { categoriesApi } from '../api/endpoints/categories.api'
import { formatDate } from '../utils/format-utils'
import type { Category } from '../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  description: z.string().trim().max(500, 'Description is too long').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export default function CategoriesPage() {
  return (
    <ResourceManager<Category, Values>
      title="Categories" singular="Category" queryKey="categories"
      description="Group products so they are easy to find and report on."
      fetchAll={() => categoriesApi.getAll()}
      create={(d) => categoriesApi.create(d as never)}
      update={(id, d) => categoriesApi.update(id, d as never)}
      remove={(id) => categoriesApi.delete(id)}
      schema={schema}
      emptyValues={{ name: '', description: '', status: 'ACTIVE' }}
      toFormValues={(c) => ({ name: c.name, description: c.description ?? '', status: c.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
      fields={[
        { name: 'name', label: 'Name', placeholder: 'e.g. Power Banks' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
      ]}
      columns={[
        { key: 'name', header: 'Name', cell: (c) => <span className="font-semibold">{c.name}</span> },
        { key: 'desc', header: 'Description', hideBelow: 'md', cell: (c) => <span className="line-clamp-1 text-muted">{c.description || '-'}</span> },
        { key: 'products', header: 'Products', align: 'right', cell: (c) => c._count?.products ?? 0 },
        { key: 'status', header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
        { key: 'created', header: 'Created', hideBelow: 'lg', cell: (c) => formatDate(c.createdAt) },
      ]}
      searchText={(c) => `${c.name} ${c.description ?? ''}`}
      rowName={(c) => c.name}
      deleteMessage={(c) => (c._count?.products ?? 0) > 0
        ? `"${c.name}" has ${c._count?.products} product(s), so it will be deactivated instead of deleted.`
        : `"${c.name}" will be permanently deleted.`}
    />
  )
}
