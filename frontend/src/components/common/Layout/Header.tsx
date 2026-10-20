import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, UserRound, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { ROLE_LABEL } from '../../../constants/roles'
import { ROUTES } from '../../../routes/route-constants'
import { initials } from '../../../utils/format-utils'
import { RoleBadge } from '../Badges/RoleBadge'

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const signOut = () => {
    logout()
    toast.success('Signed out')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-fg lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-muted sm:block">
          {greeting}, <span className="font-semibold text-fg">{user?.fullName.split(' ')[0]}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-muted transition hover:bg-surface-2 hover:text-fg"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition hover:bg-surface-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {initials(user?.fullName)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[140px] truncate text-sm font-semibold text-fg">{user?.fullName}</span>
              <span className="block text-xs text-muted">{user ? ROLE_LABEL[user.role] : ''}</span>
            </span>
          </button>

          {open && (
            <div role="menu" className="animate-pop absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-pop">
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-fg">{user?.fullName}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
                {user && <div className="mt-2"><RoleBadge role={user.role} /></div>}
              </div>
              <div className="my-1 border-t border-line" />
              <Link role="menuitem" to={ROUTES.PROFILE} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fg hover:bg-surface-2">
                <UserRound className="h-4 w-4 text-muted" /> My profile
              </Link>
              <Link role="menuitem" to={ROUTES.PROFILE} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fg hover:bg-surface-2">
                <KeyRound className="h-4 w-4 text-muted" /> Change password
              </Link>
              <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
