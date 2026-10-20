import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Gamepad2, Lock, Mail, PackageCheck, ShieldCheck, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/common/Buttons/Button'
import { FormInput } from '../components/common/Forms/FormInput'
import { ROUTES } from '../routes/route-constants'
import { getErrorMessage } from '../utils/error-utils'
import { usePageTitle } from '../hooks/usePageTitle'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  usePageTitle('Sign in')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}`)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== ROUTES.LOGIN ? from : ROUTES.DASHBOARD, { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not sign you in. Please try again.'))
    }
  })

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-nav p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" aria-hidden />
        <Link to={ROUTES.LANDING} className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700"><Gamepad2 className="h-6 w-6" /></span>
          <span className="text-xl font-bold tracking-tight">Playhouse Inventory</span>
        </Link>
        <div className="relative space-y-8">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Know exactly what is in your store, always.</h2>
          <ul className="space-y-4 text-brand-100/90">
            {[
              [PackageCheck, 'Record deliveries and sales in seconds'],
              [TrendingUp, 'Spot low stock before it costs you sales'],
              [ShieldCheck, 'Every change is tracked and attributable'],
            ].map(([Icon, text]) => {
              const I = Icon as typeof PackageCheck
              return (
                <li key={text as string} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><I className="h-4 w-4" /></span>
                  {text as string}
                </li>
              )
            })}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">&copy; {new Date().getFullYear()} Playhouse Electronics</p>
      </aside>

      <main className="flex items-center justify-center bg-bg p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white"><Gamepad2 className="h-5 w-5" /></span>
            <span className="text-lg font-bold text-fg">Playhouse Inventory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-fg">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in with the account your manager gave you.</p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            {formError && (
              <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-[38px] h-4 w-4 text-muted" />
              <FormInput label="Email address" type="email" autoComplete="username" placeholder="you@playhouse.co.ke" className="pl-10" error={errors.email?.message} {...register('email')} />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-[38px] h-4 w-4 text-muted" />
              <FormInput label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" className="pl-10 pr-11" error={errors.password?.message} {...register('password')} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-[31px] rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">Forgot your password? Ask the store manager to reset it for you.</p>
        </div>
      </main>
    </div>
  )
}
