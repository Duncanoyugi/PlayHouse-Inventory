import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Pencil, Plus, UserCheck, UserX } from 'lucide-react'
import { usersApi } from '../api/endpoints/users.api'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Buttons/Button'
import { IconButton } from '../components/common/Buttons/IconButton'
import { DataTable, type Column } from '../components/common/Table/DataTable'
import { Pagination } from '../components/common/Pagination/Pagination'
import { Modal } from '../components/common/Modal/Modal'
import { ConfirmModal } from '../components/common/Modal/ConfirmModal'
import { FormInput } from '../components/common/Forms/FormInput'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { RoleBadge } from '../components/common/Badges/RoleBadge'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { useAuth } from '../contexts/AuthContext'
import { ROLE_DESCRIPTION } from '../constants/roles'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate, initials } from '../utils/format-utils'
import { getErrorMessage } from '../utils/error-utils'
import type { Role, User } from '../types'

const password = z.string().min(8, 'At least 8 characters').regex(/[A-Za-z]/, 'Include a letter').regex(/\d/, 'Include a number').max(72, 'Too long')
const base = {
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(['ADMIN', 'STOREKEEPER']),
}
const createSchema = z.object({ ...base, password })
const editSchema = z.object({ ...base, password: z.union([z.literal(''), password]).optional() })
type FormValues = { fullName: string; email: string; role: Role; password?: string }

export default function UsersPage() {
  usePageTitle('Users')
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [toggle, setToggle] = useState<User | null>(null)
  const limit = 15

  const list = useQuery({ queryKey: ['users', page], queryFn: () => usersApi.getAll(page, limit), placeholderData: keepPreviousData })

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: (values, ctx, opts) => zodResolver(editing ? editSchema : createSchema)(values, ctx, opts) as never,
    defaultValues: { fullName: '', email: '', role: 'STOREKEEPER', password: '' },
  })

  const open = (u: User | null) => {
    setEditing(u); setCreating(!u)
    reset(u ? { fullName: u.fullName, email: u.email, role: u.role, password: '' } : { fullName: '', email: '', role: 'STOREKEEPER', password: '' })
  }
  const close = () => { setEditing(null); setCreating(false) }
  const role = useWatch({ control, name: 'role' })

  const save = useMutation({
    mutationFn: (v: FormValues) => editing
      ? usersApi.update(editing.id, { fullName: v.fullName, email: v.email, role: v.role, ...(v.password ? { password: v.password } : {}) })
      : usersApi.create({ fullName: v.fullName, email: v.email, role: v.role, password: v.password! }),
    onSuccess: () => { toast.success(editing ? 'User updated' : 'User created'); void qc.invalidateQueries({ queryKey: ['users'] }); close() },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const flip = useMutation({
    mutationFn: (u: User) => u.status === 'ACTIVE' ? usersApi.disable(u.id) : usersApi.enable(u.id),
    onSuccess: (_r, u) => { toast.success(u.status === 'ACTIVE' ? 'Account disabled' : 'Account enabled'); void qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: (e) => { toast.error(getErrorMessage(e)); throw e },
  })

  const columns: Column<User>[] = [
    { key: 'u', header: 'User', cell: (u) => (
      <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-xs font-bold text-brand-700 dark:text-brand-300">{initials(u.fullName)}</span>
        <div className="min-w-0"><p className="truncate font-semibold">{u.fullName}{u.id === me?.id && <span className="ml-2 text-xs font-normal text-muted">(you)</span>}</p><p className="truncate text-xs text-muted">{u.email}</p></div></div>
    ) },
    { key: 'r', header: 'Role', cell: (u) => <RoleBadge role={u.role} /> },
    { key: 's', header: 'Status', cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'c', header: 'Added', hideBelow: 'md', cell: (u) => formatDate(u.createdAt) },
    { key: 'a', header: <span className="sr-only">Actions</span>, align: 'right', cell: (u) => (
      <div className="flex justify-end gap-1">
        <IconButton label={`Edit ${u.fullName}`} tone="brand" onClick={() => open(u)}><Pencil className="h-4 w-4" /></IconButton>
        {u.id !== me?.id && (u.status === 'ACTIVE'
          ? <IconButton label={`Disable ${u.fullName}`} tone="danger" onClick={() => setToggle(u)}><UserX className="h-4 w-4" /></IconButton>
          : <IconButton label={`Enable ${u.fullName}`} tone="brand" onClick={() => setToggle(u)}><UserCheck className="h-4 w-4" /></IconButton>)}
      </div>
    ) },
  ]

  return (
    <>
      <PageHeader title="Users" description="Create accounts for your team and control what they can do." actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => open(null)}>Add user</Button>} />
      <section className="card overflow-hidden">
        <DataTable columns={columns} rows={list.data?.items ?? []} rowKey={(u) => u.id} isLoading={list.isLoading} isError={list.isError} onRetry={() => void list.refetch()} empty={{ title: 'No users yet' }} />
        {list.data && <Pagination page={list.data.page} totalPages={list.data.totalPages} total={list.data.total} limit={limit} onPageChange={setPage} />}
      </section>

      <Modal isOpen={creating || !!editing} onClose={close} locked={save.isPending} title={editing ? 'Edit user' : 'New user'}
        footer={<><Button variant="secondary" onClick={close} disabled={save.isPending}>Cancel</Button><Button type="submit" form="user-form" isLoading={save.isPending}>{editing ? 'Save changes' : 'Create user'}</Button></>}>
        <form id="user-form" onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          <FormInput label="Full name" required error={errors.fullName?.message} {...register('fullName')} />
          <FormInput label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
          <FormInput label={editing ? 'New password' : 'Password'} type="password" required={!editing} autoComplete="new-password" hint={editing ? 'Leave blank to keep the current password' : '8+ characters with a letter and a number'} error={errors.password?.message} {...register('password')} />
          <FormSelect label="Role" required options={[{ value: 'STOREKEEPER', label: 'Store Keeper' }, { value: 'ADMIN', label: 'Manager' }]} hint={ROLE_DESCRIPTION[role]} disabled={editing?.id === me?.id} {...register('role')} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!toggle} tone={toggle?.status === 'ACTIVE' ? 'danger' : 'success'}
        title={toggle?.status === 'ACTIVE' ? 'Disable account?' : 'Enable account?'}
        message={toggle ? (toggle.status === 'ACTIVE' ? `${toggle.fullName} will no longer be able to sign in. Their history is kept.` : `${toggle.fullName} will be able to sign in again.`) : ''}
        confirmLabel={toggle?.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        onConfirm={() => flip.mutateAsync(toggle!)} onClose={() => setToggle(null)}
      />
    </>
  )
}
