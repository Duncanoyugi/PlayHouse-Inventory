import React from 'react'
import { NavLink } from 'react-router-dom'
import { SIDEBAR_ITEMS } from '../../../routes/route-constants'
import { useAuth } from '../../../contexts/AuthContext'
import {
  LayoutDashboard,
  Package,
  Box,
  Activity,
  Users,
  FileText,
  PackageCheck,
  BarChart3,
  Shield,
  UserCog,
  MapPin,
  Tags,
  Badge,
  X,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Package: Package,
  Box: Box,
  Activity: Activity,
  Users: Users,
  FileText: FileText,
  PackageCheck: PackageCheck,
  BarChart3: BarChart3,
  Shield: Shield,
  UserCog: UserCog,
  MapPin: MapPin,
  Tags: Tags,
  Badge: Badge,
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const visibleItems = SIDEBAR_ITEMS.filter((item) => item.path !== '/audit' && item.path !== '/users' || user?.role === 'ADMIN')
  return (
    <>
      {isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed left-0 top-0 z-40 h-full w-72 max-w-[85vw] border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 lg:w-64 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-gray-200 p-4">
          <div>
            <h1 className="text-xl font-bold text-primary-600">Playhouse Inventory</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
          <button type="button" aria-label="Close navigation" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || 'Role'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}