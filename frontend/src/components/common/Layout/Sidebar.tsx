import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, ArrowLeftRight, Package, Tags, BadgeCheck, Boxes, History, Truck, MapPin,
  ShoppingCart, PackageCheck, BarChart3, ShieldCheck, Users, X, Gamepad2,
} from 'lucide-react'
import { NAV_GROUPS, type NavIcon } from '../../../routes/route-constants'
import { usePermissions } from '../../../hooks/usePermissions'
import { useAuth } from '../../../contexts/AuthContext'
import { ROLE_LABEL } from '../../../constants/roles'
import { initials } from '../../../utils/format-utils'

const ICONS: Record<NavIcon, typeof Package> = {
  dashboard: LayoutDashboard, desk: ArrowLeftRight, package: Package, tags: Tags, badge: BadgeCheck, box: Boxes,
  history: History, truck: Truck, pin: MapPin, cart: ShoppingCart, receipt: PackageCheck, chart: BarChart3,
  shield: ShieldCheck, users: Users,
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { can } = usePermissions()
  const { user } = useAuth()

  return (
    <>
      {open && <div className="animate-fade fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-nav text-nav-fg transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-900/40">
              <Gamepad2 className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-white">Playhouse</p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-brand-300/80">Inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-nav-fg hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => !i.permission || can(i.permission))
            if (items.length === 0) return null
            return (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-nav-fg/50">{group.title}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = ICONS[item.icon]
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            clsx(
                              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                              isActive ? 'bg-nav-active text-white' : 'hover:bg-white/5 hover:text-white',
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon className={clsx('h-[18px] w-[18px]', isActive ? 'text-brand-300' : 'text-nav-fg/70 group-hover:text-brand-300')} />
                              {item.label}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="m-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">
            {initials(user?.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-nav-fg/70">{user ? ROLE_LABEL[user.role] : ''}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
