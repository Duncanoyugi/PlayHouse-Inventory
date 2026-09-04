import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { LogOut, User, Settings, Bell, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label="Open navigation" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
            Welcome back, {user?.fullName || 'User'}
          </h2>
          <p className="text-xs text-gray-500 sm:text-sm">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Storekeeper'}
          </p>
        </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          <button aria-label="Notifications" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <Bell className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            aria-label="Profile"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <User className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}