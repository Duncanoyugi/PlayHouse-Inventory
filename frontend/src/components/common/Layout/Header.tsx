import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { LogOut, User, Settings, Bell, Menu, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../../../api/endpoints/inventory.api'

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const lowStockQuery = useQuery({ queryKey: ['header-low-stock'], queryFn: () => inventoryApi.getLowStock(), staleTime: 60_000 })
  const alertCount = (lowStockQuery.data?.lowStock.length || 0) + (lowStockQuery.data?.outOfStock.length || 0)

  const enableNotifications = () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported here')
      return
    }
    void Notification.requestPermission().then((permission) => {
      if (permission === 'granted') new Notification('PlayHouse Inventory', { body: alertCount ? `${alertCount} stock alerts need attention.` : 'You have no outstanding stock alerts.' })
      else toast.error('Notification permission was not granted')
    })
  }

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
          <div className="relative">
          <button type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{alertCount}</span>}
          </button>
          {notificationsOpen && <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><p className="font-semibold text-gray-900">Notifications</p><button type="button" onClick={enableNotifications} className="text-xs font-semibold text-cyan-700">Enable push</button></div>{alertCount ? <button type="button" onClick={() => navigate('/inventory')} className="mt-3 flex w-full items-start gap-2 rounded-lg bg-amber-50 p-3 text-left text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{alertCount} stock alert{alertCount === 1 ? '' : 's'} need attention.</button> : <p className="mt-3 text-sm text-gray-500">No new notifications.</p>}</div>}
          </div>

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