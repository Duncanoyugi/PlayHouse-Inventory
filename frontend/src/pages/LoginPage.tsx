import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined
      toast.error(message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Playhouse Inventory</h2>
        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label><input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field mt-1" placeholder="admin@playhouse.co.ke" /></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field mt-1" placeholder="••••••••" /></div>
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">{isLoading ? 'Signing in...' : 'Sign in'}</button>
        <div className="text-sm text-center text-gray-500"><p>Default credentials:</p><p>Admin: admin@playhouse.co.ke / Admin@123</p><p>Storekeeper: storekeeper@playhouse.co.ke / Storekeeper@123</p></div>
      </form>
    </div>
  )
}