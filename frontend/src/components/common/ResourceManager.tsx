import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from './Buttons/Button'
import { Modal } from './Modal/Modal'
import LoadingSpinner from './Loading/LoadingSpinner'

type Field = { key: string; label: string; placeholder?: string; required?: boolean }
type Resource = Record<string, any> & { id: string; name: string; status?: string }

type ResourceManagerProps = {
  title: string
  description: string
  resourceName: string
  fields: Field[]
  queryKey: string
  list: (status?: string) => Promise<Resource[]>
  create: (data: any) => Promise<unknown>
  update: (id: string, data: any) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  canManage?: boolean
}

export function ResourceManager({ title, description, resourceName, fields, queryKey, list, create, update, remove, canManage = true }: ResourceManagerProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Resource | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: [queryKey], queryFn: () => list() })
  const filtered = useMemo(() => data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [data, search])

  const openCreate = () => { setDraft({}); setEditing(null); setIsCreating(true) }
  const openEdit = (item: Resource) => { setDraft(Object.fromEntries(fields.map((field) => [field.key, item[field.key] || '']))); setEditing(item); setIsCreating(true) }
  const close = () => { setIsCreating(false); setEditing(null) }
  const save = async () => {
    try {
      if (editing) await update(editing.id, draft)
      else await create(draft)
      toast.success(`${resourceName} ${editing ? 'updated' : 'created'}`)
      close()
      void queryClient.invalidateQueries({ queryKey: [queryKey] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Unable to save ${resourceName.toLowerCase()}`)
    }
  }
  const destroy = async (item: Resource) => {
    if (!window.confirm(`Delete ${item.name}? This action cannot be undone.`)) return
    try {
      await remove(item.id)
      toast.success(`${resourceName} deleted`)
      void queryClient.invalidateQueries({ queryKey: [queryKey] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Unable to delete ${resourceName.toLowerCase()}`)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Catalog</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
      {canManage && <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add {resourceName}</Button>}
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="relative block max-w-md flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /></label><Button variant="outline" size="sm" onClick={() => void refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div>
      {isError ? <div className="p-10 text-center text-sm text-rose-600">Unable to load {title.toLowerCase()}.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Name</th>{fields.filter((field) => field.key !== 'name').map((field) => <th key={field.key} className="px-4 py-3">{field.label}</th>)}<th className="px-4 py-3">Status</th>{canManage && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-medium text-slate-900">{item.name}</td>{fields.filter((field) => field.key !== 'name').map((field) => <td key={field.key} className="px-4 py-4 text-slate-600">{item[field.key] || '-'}</td>)}<td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.status || 'ACTIVE'}</span></td>{canManage && <td className="px-4 py-4 text-right"><button title="Edit" className="mr-3 text-slate-500 hover:text-cyan-700" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></button><button title="Delete" className="text-slate-500 hover:text-rose-700" onClick={() => void destroy(item)}><Trash2 className="h-4 w-4" /></button></td>}</tr>)}{!filtered.length && <tr><td colSpan={fields.length + (canManage ? 3 : 2)} className="px-4 py-12 text-center text-slate-500">No {title.toLowerCase()} found.</td></tr>}</tbody></table></div>}
    </section>
    {canManage && <Modal isOpen={isCreating} onClose={close} title={`${editing ? 'Edit' : 'Add'} ${resourceName}`}>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void save() }}>{fields.map((field) => <label key={field.key} className="block"><span className="mb-1 block text-sm font-medium text-slate-700">{field.label}</span>{field.key === 'description' || field.key === 'address' ? <textarea value={draft[field.key] || ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} required={field.required} placeholder={field.placeholder} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" /> : <input value={draft[field.key] || ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} required={field.required} placeholder={field.placeholder} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />}</label>)}<div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit">Save {resourceName}</Button></div></form>
    </Modal>}
  </div>
}
