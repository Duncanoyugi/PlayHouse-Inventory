import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { productsApi } from '../api/endpoints/products.api'
import { categoriesApi } from '../api/endpoints/categories.api'
import { brandsApi } from '../api/endpoints/brands.api'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Buttons/Button'
import { IconButton } from '../components/common/Buttons/IconButton'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { SearchBar } from '../components/common/Search/SearchBar'
import { Modal } from '../components/common/Modal/Modal'
import { ConfirmModal } from '../components/common/Modal/ConfirmModal'
import { FormInput } from '../components/common/Forms/FormInput'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { FormTextarea } from '../components/common/Forms/FormTextarea'
import { StatusBadge, Badge } from '../components/common/Badges/StatusBadge'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatMoney, formatNumber, compactObject } from '../utils/format-utils'
import { getErrorMessage } from '../utils/error-utils'
import type { Product, Status } from '../types'

const schema = z.object({
  sku: z.string().trim().min(5, 'SKU must be at least 5 characters').max(50, 'SKU is too long'),
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(200, 'Name is too long'),
  description: z.string().trim().max(1000, 'Too long').optional(),
  barcode: z.string().trim().max(50, 'Too long').optional(),
  costPrice: z.coerce.number({ message: 'Enter a valid price' }).min(0, 'Cannot be negative').max(100_000_000, 'Too large')
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, 'At most 2 decimal places'),
  reorderLevel: z.coerce.number({ message: 'Enter a whole number' }).int('Must be a whole number').min(0, 'Cannot be negative').max(1_000_000, 'Too large'),
  categoryId: z.string().min(1, 'Choose a category'),
  brandId: z.string().min(1, 'Choose a brand'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
})
type FormIn = z.input<typeof schema>
type FormOut = z.output<typeof schema>

const EMPTY: FormIn = { sku: '', name: '', description: '', barcode: '', costPrice: '' as unknown as number, reorderLevel: 5, categoryId: '', brandId: '', status: 'ACTIVE' }

export default function ProductsPage() {
  usePageTitle('Products')
  const { can } = usePermissions()
  const manage = can('catalog:manage')
  const showCost = can('cost:view')
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [status, setStatus] = useState<'' | Status>('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const limit = 15
  const list = useQuery({
    queryKey: ['products', { search, categoryId, brandId, status, page }],
    queryFn: () => productsApi.getAll({ search: search || undefined, categoryId: categoryId || undefined, brandId: brandId || undefined, status: status || undefined, page, limit }),
    placeholderData: keepPreviousData,
  })
  const categories = useQuery({ queryKey: ['categories', 'all'], queryFn: () => categoriesApi.getAll() })
  const brands = useQuery({ queryKey: ['brands', 'all'], queryFn: () => brandsApi.getAll() })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(schema), defaultValues: EMPTY })

  const openForm = (p: Product | null) => {
    setEditing(p)
    setCreating(!p)
    reset(p ? {
      sku: p.sku, name: p.name, description: p.description ?? '', barcode: p.barcode ?? '', costPrice: Number(p.costPrice ?? 0),
      reorderLevel: p.reorderLevel, categoryId: p.categoryId, brandId: p.brandId, status: p.status,
    } : EMPTY)
  }
  const closeForm = () => { setEditing(null); setCreating(false) }

  const save = useMutation({
    mutationFn: (v: FormOut) => {
      const payload = compactObject(v) as never
      return editing ? productsApi.update(editing.id, payload) : productsApi.create(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created')
      void qc.invalidateQueries({ queryKey: ['products'] })
      closeForm()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const del = useMutation({
    mutationFn: (p: Product) => productsApi.delete(p.id),
    onSuccess: () => { toast.success('Product removed'); void qc.invalidateQueries({ queryKey: ['products'] }) },
    onError: (e) => { toast.error(getErrorMessage(e)); throw e },
  })

  const reset1 = (fn: () => void) => { fn(); setPage(1) }

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product', cell: (p) => <div className="min-w-[180px]"><p className="font-semibold">{p.name}</p><p className="text-xs text-muted">{p.sku}{p.barcode ? ` - ${p.barcode}` : ''}</p></div> },
    { key: 'cat', header: 'Category', hideBelow: 'md', cell: (p) => <div><p>{p.category?.name ?? '-'}</p><p className="text-xs text-muted">{p.brand?.name ?? ''}</p></div> },
    ...(showCost ? [{ key: 'cost', header: 'Cost', align: 'right' as const, hideBelow: 'lg' as const, cell: (p: Product) => formatMoney(p.costPrice) }] : []),
    {
      key: 'stock', header: 'In stock', align: 'right',
      cell: (p) => {
        const qty = p.availableQuantity ?? 0
        const tone = qty <= 0 ? 'red' : qty <= p.reorderLevel ? 'amber' : 'green'
        return <Badge tone={tone}>{formatNumber(qty)}</Badge>
      },
    },
    { key: 'reorder', header: 'Reorder at', align: 'right', hideBelow: 'lg', cell: (p) => formatNumber(p.reorderLevel) },
    { key: 'status', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
    ...(manage ? [{
      key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right' as const,
      cell: (p: Product) => (
        <div className="flex justify-end gap-1">
          <IconButton label={`Edit ${p.name}`} tone="brand" onClick={() => openForm(p)}><Pencil className="h-4 w-4" /></IconButton>
          <IconButton label={`Delete ${p.name}`} tone="danger" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></IconButton>
        </div>
      ),
    }] : []),
  ]

  const catOptions = (categories.data ?? []).filter((c) => c.status === 'ACTIVE' || c.id === editing?.categoryId).map((c) => ({ value: c.id, label: c.name }))
  const brandOptions = (brands.data ?? []).filter((b) => b.status === 'ACTIVE' || b.id === editing?.brandId).map((b) => ({ value: b.id, label: b.name }))

  return (
    <>
      <PageHeader
        title="Products"
        description={manage ? 'Your catalogue. Add products here before recording stock for them.' : 'Browse the catalogue. Only the manager can change product details.'}
        actions={manage && <Button icon={<Plus className="h-4 w-4" />} onClick={() => openForm(null)}>Add product</Button>}
      />

      <section className="card overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SearchBar value={search} onChange={(v) => reset1(() => setSearch(v))} placeholder="Search name, SKU or barcode" className="sm:col-span-2 lg:col-span-1" />
          <FormSelect aria-label="Category" placeholder="All categories" value={categoryId} onChange={(e) => reset1(() => setCategoryId(e.target.value))} options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          <FormSelect aria-label="Brand" placeholder="All brands" value={brandId} onChange={(e) => reset1(() => setBrandId(e.target.value))} options={(brands.data ?? []).map((b) => ({ value: b.id, label: b.name }))} />
          <FormSelect aria-label="Status" placeholder="Any status" value={status} onChange={(e) => reset1(() => setStatus(e.target.value as '' | Status))} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'DISCONTINUED', label: 'Discontinued' }]} />
        </div>
        <DataTable
          columns={columns}
          rows={list.data?.items ?? []}
          rowKey={(p) => p.id}
          isLoading={list.isLoading}
          isError={list.isError}
          onRetry={() => void list.refetch()}
          empty={{ title: 'No products found', description: search || categoryId || brandId || status ? 'Try changing your filters.' : 'Add your first product to start tracking stock.', action: manage && !search ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => openForm(null)}>Add product</Button> : undefined }}
        />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>

      <Modal
        isOpen={creating || !!editing}
        onClose={closeForm}
        locked={save.isPending}
        size="lg"
        title={editing ? 'Edit product' : 'New product'}
        description="SKU must be unique. Cost price is what you pay the supplier."
        footer={<><Button variant="secondary" onClick={closeForm} disabled={save.isPending}>Cancel</Button><Button type="submit" form="product-form" isLoading={save.isPending}>{editing ? 'Save changes' : 'Create product'}</Button></>}
      >
        <form id="product-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormInput label="SKU" required placeholder="e.g. ORM-PB-10K" error={errors.sku?.message} {...register('sku')} />
          <FormInput label="Barcode" placeholder="Optional" error={errors.barcode?.message} {...register('barcode')} />
          <div className="sm:col-span-2"><FormInput label="Product name" required error={errors.name?.message} {...register('name')} /></div>
          <FormSelect label="Category" required placeholder="Select category" options={catOptions} error={errors.categoryId?.message} {...register('categoryId')} />
          <FormSelect label="Brand" required placeholder="Select brand" options={brandOptions} error={errors.brandId?.message} {...register('brandId')} />
          <FormInput label="Cost price" required type="number" step="0.01" min="0" inputMode="decimal" suffix="KES" error={errors.costPrice?.message} {...register('costPrice')} />
          <FormInput label="Reorder level" required type="number" step="1" min="0" inputMode="numeric" hint="Alert when stock falls to this number" error={errors.reorderLevel?.message} {...register('reorderLevel')} />
          <div className="sm:col-span-2"><FormSelect label="Status" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'DISCONTINUED', label: 'Discontinued' }]} error={errors.status?.message} {...register('status')} /></div>
          <div className="sm:col-span-2"><FormTextarea label="Description" placeholder="Optional" error={errors.description?.message} {...register('description')} /></div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        title="Delete product?"
        message={deleting ? `"${deleting.name}" will be deleted. If it already has stock or history it will be deactivated instead so records stay intact.` : ''}
        confirmLabel="Delete"
        onConfirm={() => del.mutateAsync(deleting!)}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
