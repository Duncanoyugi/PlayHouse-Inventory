import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/endpoints/users.api'
import { DataTable } from '../components/common/Table/DataTable'
import { StatusBadge } from '../components/common/Badges/StatusBadge'
import { RoleBadge } from '../components/common/Badges/RoleBadge'
import { Button } from '../components/common/Buttons/Button'
import { Modal } from '../components/common/Modal/Modal'
import { FormInput } from '../components/common/Forms/FormInput'
import { FormSelect } from '../components/common/Forms/FormSelect'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Pencil, Trash2, Plus, RefreshCw, UserX, UserCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  password: z.string().max(50, 'Password cannot exceed 50 characters').optional(),
  role: z.enum(['ADMIN', 'STOREKEEPER']),
  status: z.enum(['ACTIVE', 'DISABLED']),
})

type UserFormData = z.infer<typeof userSchema>

export const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  const { data: usersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
      setIsModalOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to create user' : 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { email?: string; fullName?: string; role?: string; status?: string; password?: string } }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
      setIsModalOpen(false)
      setEditingUser(null)
      reset()
    },
    onError: (error: unknown) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to update user' : 'Failed to update user')
    },
  })

  const disableMutation = useMutation({
    mutationFn: usersApi.disable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User disabled successfully')
    },
    onError: (error: unknown) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to disable user' : 'Failed to disable user')
    },
  })

  const enableMutation = useMutation({
    mutationFn: usersApi.enable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User enabled successfully')
    },
    onError: (error: unknown) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to enable user' : 'Failed to enable user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
      setDeletingUser(null)
    },
    onError: (error: unknown) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to delete user' : 'Failed to delete user')
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: 'ACTIVE',
      role: 'STOREKEEPER',
    },
  })

  const onSubmit = (data: UserFormData) => {
    if (!editingUser && (!data.password || data.password.length < 8)) {
      toast.error('Password must be at least 8 characters when creating a user')
      return
    }
    if (editingUser) {
      // Remove password if empty
      if (!data.password) {
        delete data.password
      }
      updateMutation.mutate({ id: editingUser.id, data })
    } else {
      createMutation.mutate({ ...data, password: data.password || '' })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    reset({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleToggleStatus = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Cannot change your own status')
      return
    }

    if (user.status === 'ACTIVE') {
      if (user.role === 'ADMIN') {
        const adminCount = usersData?.items?.filter(
          (u: User) => u.role === 'ADMIN' && u.status === 'ACTIVE'
        ).length || 0
        if (adminCount <= 1) {
          toast.error('Cannot disable the last admin user')
          return
        }
      }
      disableMutation.mutate(user.id)
    } else {
      enableMutation.mutate(user.id)
    }
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (item: User) => (
        <div>
          <div className="font-medium text-gray-900">{item.fullName}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: User) => <RoleBadge role={item.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: User) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: User) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: User) => (
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {item.id !== currentUser?.id && (
            <button
              onClick={() => handleToggleStatus(item)}
              className={item.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
              title={item.status === 'ACTIVE' ? 'Disable' : 'Enable'}
            >
              {item.status === 'ACTIVE' ? (
                <UserX className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
            </button>
          )}

          {item.id !== currentUser?.id && item.status === 'DISABLED' && (
            <button
              onClick={() => setDeletingUser(item)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'STOREKEEPER', label: 'Storekeeper' },
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DISABLED', label: 'Disabled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Administration</p>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => {
          setEditingUser(null)
          reset({ status: 'ACTIVE', role: 'STOREKEEPER' })
          setIsModalOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Team directory</p>
            <p className="text-sm text-gray-500">{usersData?.total || 0} registered users</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
        {isError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Unable to load users. Check that you are signed in as an administrator and try again.</p>}
        <DataTable
          columns={columns}
          data={usersData?.items || []}
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
          reset()
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="e.g., user@playhouse.co.ke"
            />

            <FormInput
              label="Full Name"
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="e.g., John Doe"
            />

            <FormInput
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
            />

            <FormSelect
              label="Role"
              {...register('role')}
              error={errors.role?.message}
              options={roleOptions}
            />

            <FormSelect
              label="Status"
              {...register('status')}
              error={errors.status?.message}
              options={statusOptions}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingUser(null)
                reset()
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{deletingUser?.fullName}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => { if (deletingUser) deleteMutation.mutate(deletingUser.id) }}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}