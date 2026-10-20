import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/common/Layout/Sidebar'
import { Header } from '../components/common/Layout/Header'
import { LoadingSpinner } from '../components/common/Loading/LoadingSpinner'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

export function MainLayout() {
  const { pathname } = useLocation()
  // The mobile menu is only "open" for the page it was opened on, so navigating closes it.
  const [menu, setMenu] = useState<{ open: boolean; path: string }>({ open: false, path: pathname })
  const menuOpen = menu.open && menu.path === pathname
  const setMenuOpen = (open: boolean) => setMenu({ open, path: pathname })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-screen bg-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-72">
        <Header onMenu={() => setMenuOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
