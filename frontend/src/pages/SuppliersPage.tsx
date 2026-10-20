import { z } from 'zod'
import { ResourceManager } from '../components/common/ResourceManager'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { suppliersApi } from '../api/endpoints/suppliers.api'
import type { Supplier } from '../types'

const optional = (max: number) => z.string().trim().max(max, 'Too long').optional()
const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150, 'Name is too long'),
  contactPerson: optional(100),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).optional(),
  phone: z.union([z.literal(''), z.string().trim().regex(/^\+?[\d\s-]{9,16}$/, 'Enter a valid phone number, e.g. 0712 345 678')]).optional(),
  address: optional(255),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export default function SuppliersPage() {
  return (
    <ResourceManager<Supplier, Values>
      title="Suppliers" singular="Supplier" queryKey="suppliers"
      description="The companies you buy stock from."
      fetchAll={() => suppliersApi.getAll()}
      create={(d) => suppliersApi.create(d as never)}
      update={(id, d) => suppliersApi.update(id, d as never)}
      remove={(id) => suppliersApi.delete(id)}
      schema={schema}
      emptyValues={{ name: '', contactPerson: '', email: '', phone: '', address: '', status: 'ACTIVE' }}
      toFormValues={(s) => ({ name: s.name, contactPerson: s.contactPerson ?? '', email: s.email ?? '', phone: s.phone ?? '', address: s.address ?? '', status: s.status })}
      fields={[
        { name: 'name', label: 'Supplier name', placeholder: 'e.g. Nairobi Electronics Ltd' },
        { name: 'contactPerson', label: 'Contact person' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '0712 345 678' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
      ]}
      columns={[
        { key: 'name', header: 'Supplier', cell: (s) => <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted">{s.contactPerson || '-'}</p></div> },
        { key: 'contact', header: 'Contact', hideBelow: 'md', cell: (s) => <div className="text-sm"><p>{s.email || '-'}</p><p className="text-xs text-muted">{s.phone || ''}</p></div> },
        { key: 'orders', header: 'Orders', align: 'right', hideBelow: 'sm', cell: (s) => s._count?.purchaseOrders ?? 0 },
        { key: 'status', header: 'Status', cell: (s) => <StatusBadge status={s.status} /> },
      ]}
      searchText={(s) => `${s.name} ${s.contactPerson ?? ''} ${s.email ?? ''} ${s.phone ?? ''}`}
      rowName={(s) => s.name}
      deleteMessage={(s) => (s._count?.purchaseOrders ?? 0) > 0
        ? `"${s.name}" has purchase orders, so it will be deactivated instead of deleted.`
        : `"${s.name}" will be permanently deleted.`}
    />
  )
}
