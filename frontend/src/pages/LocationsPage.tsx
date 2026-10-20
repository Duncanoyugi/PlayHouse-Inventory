import { z } from 'zod'
import { ResourceManager } from '../components/common/ResourceManager'
import { locationsApi } from '../api/endpoints/locations.api'
import { formatDate } from '../utils/format-utils'
import type { Location } from '../types'

const schema = z.object({ name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long') })
type Values = z.infer<typeof schema>

export default function LocationsPage() {
  return (
    <ResourceManager<Location, Values>
      title="Locations" singular="Location" queryKey="locations"
      description="Stores, shelves or warehouses where stock is kept."
      fetchAll={() => locationsApi.getAll()}
      create={(d) => locationsApi.create(d as { name: string })}
      update={(id, d) => locationsApi.update(id, d as { name: string })}
      remove={(id) => locationsApi.delete(id)}
      schema={schema}
      emptyValues={{ name: '' }}
      toFormValues={(l) => ({ name: l.name })}
      fields={[{ name: 'name', label: 'Location name', placeholder: 'e.g. Main Store' }]}
      columns={[
        { key: 'name', header: 'Location', cell: (l) => <span className="font-semibold">{l.name}</span> },
        { key: 'items', header: 'Stock lines', align: 'right', cell: (l) => l._count?.inventories ?? 0 },
        { key: 'created', header: 'Created', hideBelow: 'md', cell: (l) => formatDate(l.createdAt) },
      ]}
      searchText={(l) => l.name}
      rowName={(l) => l.name}
      deleteMessage={(l) => `"${l.name}" will be deleted. Locations that hold stock or receipts cannot be deleted.`}
    />
  )
}
