import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, type DefaultValues, type FieldValues, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType, ZodTypeDef } from 'zod'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { Button } from './Buttons/Button'
import { IconButton } from './Buttons/IconButton'
import { Modal } from './Modal/Modal'
import { ConfirmModal } from './Modal/ConfirmModal'
import { DataTable, type Column } from './Table/DataTable'
import { SearchBar } from './Search/SearchBar'
import { FormInput } from './Forms/FormInput'
import { FormSelect } from './Forms/FormSelect'
import { FormTextarea } from './Forms/FormTextarea'
import { getErrorMessage } from '../../utils/error-utils'
import { compactObject } from '../../utils/format-utils'
import { usePageTitle } from '../../hooks/usePageTitle'

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  hint?: string
}

interface ResourceManagerProps<T extends { id: string }, F extends FieldValues> {
  title: string
  description: string
  singular: string
  queryKey: string
  icon?: ReactNode
  fetchAll: () => Promise<T[]>
  create: (data: Record<string, unknown>) => Promise<unknown>
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  schema: ZodType<F, ZodTypeDef, F>
  emptyValues: DefaultValues<F>
  toFormValues: (row: T) => DefaultValues<F>
  fields: FieldDef[]
  columns: Column<T>[]
  searchText: (row: T) => string
  /** Message shown in the delete confirmation. */
  deleteMessage: (row: T) => string
  rowName: (row: T) => string
}

export function ResourceManager<T extends { id: string }, F extends FieldValues>(props: ResourceManagerProps<T, F>) {
  const { title, description, singular, queryKey, fetchAll, create, update, remove, schema, emptyValues, toFormValues, fields, columns, searchText, deleteMessage, rowName } = props
  usePageTitle(title)
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)

  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: [queryKey], queryFn: fetchAll })
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? data.filter((r) => searchText(r).toLowerCase().includes(q)) : data
  }, [data, search, searchText])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  const open = (row: T | null) => {
    setEditing(row)
    setCreating(row === null)
    reset(row ? toFormValues(row) : emptyValues)
  }
  const close = () => { setEditing(null); setCreating(false) }

  const save = useMutation({
    mutationFn: (values: F) => {
      const payload = compactObject(values as Record<string, unknown>)
      return editing ? update(editing.id, payload) : create(payload)
    },
    onSuccess: () => {
      toast.success(`${singular} ${editing ? 'updated' : 'created'}`)
      void qc.invalidateQueries({ queryKey: [queryKey] })
      close()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const del = useMutation({
    mutationFn: (row: T) => remove(row.id),
    onSuccess: () => {
      toast.success(`${singular} removed`)
      void qc.invalidateQueries({ queryKey: [queryKey] })
    },
    onError: (e) => { toast.error(getErrorMessage(e)); throw e },
  })

  const allColumns: Column<T>[] = [
    ...columns,
    {
      key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <IconButton label={`Edit ${rowName(row)}`} tone="brand" onClick={() => open(row)}><Pencil className="h-4 w-4" /></IconButton>
          <IconButton label={`Delete ${rowName(row)}`} tone="danger" onClick={() => setDeleting(row)}><Trash2 className="h-4 w-4" /></IconButton>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={title} description={description} actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => open(null)}>Add {singular.toLowerCase()}</Button>} />

      <section className="card overflow-hidden">
        <div className="border-b border-line p-4"><SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} className="max-w-sm" /></div>
        <DataTable
          columns={allColumns}
          rows={rows}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          empty={{
            title: search ? 'No matches' : `No ${title.toLowerCase()} yet`,
            description: search ? 'Try a different search term.' : `Add your first ${singular.toLowerCase()} to get started.`,
            action: !search ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => open(null)}>Add {singular.toLowerCase()}</Button> : undefined,
          }}
        />
      </section>

      <Modal
        isOpen={creating || !!editing}
        onClose={close}
        locked={save.isPending}
        title={editing ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={save.isPending}>Cancel</Button>
            <Button type="submit" form="resource-form" isLoading={isSubmitting || save.isPending}>{editing ? 'Save changes' : `Create ${singular.toLowerCase()}`}</Button>
          </>
        }
      >
        <form id="resource-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          {fields.map((f) => {
            const error = (errors as Record<string, { message?: string }>)[f.name]?.message
            const name = f.name as Path<F>
            if (f.type === 'textarea') return <FormTextarea key={f.name} label={f.label} placeholder={f.placeholder} hint={f.hint} error={error} {...register(name)} />
            if (f.type === 'select') return <FormSelect key={f.name} label={f.label} options={f.options ?? []} hint={f.hint} error={error} {...register(name)} />
            return <FormInput key={f.name} label={f.label} type={f.type ?? 'text'} placeholder={f.placeholder} hint={f.hint} error={error} {...register(name)} />
          })}
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleting}
        title={`Delete ${singular.toLowerCase()}?`}
        message={deleting ? deleteMessage(deleting) : ''}
        confirmLabel="Delete"
        onConfirm={() => del.mutateAsync(deleting!)}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
