import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormInput } from '../common/Forms/FormInput'
import { FormSelect } from '../common/Forms/FormSelect'
import { Button } from '../common/Buttons/Button'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  status: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: undefined as any,
    defaultValues: { status: 'ACTIVE', role: 'STOREKEEPER' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <FormInput
        label="Full Name"
        {...register('fullName')}
        error={errors.fullName?.message}
      />

      <FormInput
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />

      <FormSelect
        label="Role"
        {...register('role')}
        error={errors.role?.message}
        options={[
          { value: 'ADMIN', label: 'Admin' },
          { value: 'STOREKEEPER', label: 'Storekeeper' },
        ]}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create User
        </Button>
      </div>
    </form>
  )
}
