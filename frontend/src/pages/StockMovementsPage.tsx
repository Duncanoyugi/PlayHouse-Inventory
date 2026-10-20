import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PageHeader } from '../components/common/PageHeader'
import { MovementTable } from '../components/stock-movements/MovementTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { FormInput } from '../components/common/Forms/FormInput'
import { ProductPicker } from '../components/common/ProductPicker'
import { Button } from '../components/common/Buttons/Button'
import { stockMovementsApi } from '../api/endpoints/stock-movements.api'
import { locationsApi } from '../api/endpoints/locations.api'
import { MOVEMENT_TYPES } from '../constants/statuses'
import { titleCase } from '../utils/format-utils'
import { usePageTitle } from '../hooks/usePageTitle'
import type { MovementType, Product } from '../types'

export default function StockMovementsPage() {
  usePageTitle('Stock movements')
  const [type, setType] = useState<'' | MovementType>('')
  const [locationId, setLocationId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20

  const locations = useQuery({ queryKey: ['locations'], queryFn: () => locationsApi.getAll() })
  const list = useQuery({
    queryKey: ['stock-movements', { type, locationId, fromDate, toDate, product: product?.id, page }],
    queryFn: () => stockMovementsApi.getAll({ type: type || undefined, locationId: locationId || undefined, productId: product?.id, fromDate: fromDate || undefined, toDate: toDate || undefined, page, limit }),
    placeholderData: keepPreviousData,
  })

  const filtered = !!(type || locationId || fromDate || toDate || product)
  const clear = () => { setType(''); setLocationId(''); setFromDate(''); setToDate(''); setProduct(null); setPage(1) }

  return (
    <>
      <PageHeader title="Stock movements" description="A permanent record of everything that came in, went out or was corrected." />
      <section className="card overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2"><ProductPicker value={product} onChange={(p) => { setProduct(p); setPage(1) }} placeholder="Filter by product" /></div>
          <FormSelect aria-label="Type" placeholder="All types" value={type} onChange={(e) => { setType(e.target.value as '' | MovementType); setPage(1) }} options={MOVEMENT_TYPES.map((t) => ({ value: t, label: titleCase(t) }))} />
          <FormSelect aria-label="Location" placeholder="All locations" value={locationId} onChange={(e) => { setLocationId(e.target.value); setPage(1) }} options={(locations.data ?? []).map((l) => ({ value: l.id, label: l.name }))} />
          <FormInput aria-label="From date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} />
          <FormInput aria-label="To date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
          {filtered && <div className="sm:col-span-2 lg:col-span-6"><Button variant="ghost" size="sm" onClick={clear}>Clear filters</Button></div>}
        </div>
        <MovementTable rows={list.data?.items ?? []} isLoading={list.isLoading} isError={list.isError} onRetry={() => void list.refetch()} />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>
    </>
  )
}
