import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/endpoints/auth.api'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Buttons/Button'
import { FormInput } from '../components/common/Forms/FormInput'
import { RoleBadge } from '../components/common/Badges/RoleBadge'
import { ROLE_DESCRIPTION } from '../constants/roles'
import { formatDate, initials } from '../utils/format-utils'
import { getErrorMessage } from '../utils/error-utils'
import { usePageTitle } from '../hooks/usePageTitle'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a different password' })
type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  usePageTitle('My profile')
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const change = useMutation({
    mutationFn: (v: FormValues) => authApi.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: () => { toast.success('Password changed'); reset() },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (!user) return null

  return (
    <>
      <PageHeader title="My profile" description="Your account details and security." />
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card card-pad lg:col-span-2">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">{initials(user.fullName)}</span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-fg">{user.fullName}</h2>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-muted" /><div><dt className="text-muted">Email</dt><dd className="font-medium text-fg">{user.email}</dd></div></div>
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-muted" /><div><dt className="text-muted">What you can do</dt><dd className="font-medium text-fg">{ROLE_DESCRIPTION[user.role]}</dd></div></div>
            <div className="flex items-start gap-3"><KeyRound className="mt-0.5 h-4 w-4 text-muted" /><div><dt className="text-muted">Member since</dt><dd className="font-medium text-fg">{formatDate(user.createdAt)}</dd></div></div>
          </dl>
        </section>

        <section className="card card-pad lg:col-span-3">
          <h2 className="text-lg font-semibold text-fg">Change password</h2>
          <p className="mt-1 text-sm text-muted">Use at least 8 characters with a letter and a number.</p>
          <form onSubmit={handleSubmit((v) => change.mutate(v))} noValidate className="mt-6 space-y-5">
            <FormInput label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
              <FormInput label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            </div>
            <div className="flex justify-end"><Button type="submit" isLoading={change.isPending}>Update password</Button></div>
          </form>
        </section>
      </div>
    </>
  )
}
