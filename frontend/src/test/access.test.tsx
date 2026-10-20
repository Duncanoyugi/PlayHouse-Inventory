import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Sidebar } from '../components/common/Layout/Sidebar'
import { AppRouter } from '../routes/AppRouter'
import { makeUser, renderApp } from './helpers'
import type { User } from '../types'

const auth = vi.hoisted(() => ({ user: null as User | null }))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: auth.user, isAuthenticated: !!auth.user, isLoading: false, login: vi.fn(), logout: vi.fn(), setUser: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Keep the pages that fire network calls out of these navigation tests.
vi.mock('../pages/DashboardPage', () => ({ default: () => <h1>Dashboard stub</h1> }))
vi.mock('../pages/StockDeskPage', () => ({ default: () => <h1>Stock desk stub</h1> }))

const MANAGER_ONLY = ['Users', 'Reports', 'Audit Log', 'Suppliers', 'Categories', 'Brands', 'Locations']
const KEEPER_LINKS = ['Dashboard', 'Stock In / Out', 'Inventory', 'Movements', 'Goods Receiving', 'Products', 'Purchase Orders']

describe('navigation by role', () => {
  beforeEach(() => { auth.user = null })

  it('shows a store keeper only the store-keeping links', () => {
    auth.user = makeUser('STOREKEEPER')
    renderApp(<Sidebar open onClose={() => undefined} />)
    for (const label of KEEPER_LINKS) expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    for (const label of MANAGER_ONLY) expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument()
  })

  it('shows the manager everything', () => {
    auth.user = makeUser('ADMIN')
    renderApp(<Sidebar open onClose={() => undefined} />)
    for (const label of [...KEEPER_LINKS, ...MANAGER_ONLY]) expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  })

  it('labels the ADMIN role as Manager', () => {
    auth.user = makeUser('ADMIN')
    renderApp(<Sidebar open onClose={() => undefined} />)
    expect(screen.getByText('Manager')).toBeInTheDocument()
  })
})

describe('route protection', () => {
  beforeEach(() => { auth.user = null })

  it('sends signed-out visitors to the login page', async () => {
    renderApp(<AppRouter />, { route: '/dashboard' })
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it.each(['/users', '/reports', '/audit', '/suppliers', '/categories', '/brands', '/locations'])(
    'blocks a store keeper from %s',
    async (path) => {
      auth.user = makeUser('STOREKEEPER')
      renderApp(<AppRouter />, { route: path })
      expect(await screen.findByRole('heading', { name: 'Manager access only' })).toBeInTheDocument()
    },
  )

  it('lets a store keeper open the stock desk', async () => {
    auth.user = makeUser('STOREKEEPER')
    renderApp(<AppRouter />, { route: '/stock-desk' })
    expect(await screen.findByRole('heading', { name: 'Stock desk stub' })).toBeInTheDocument()
  })

  it('lets the manager past the guard', async () => {
    auth.user = makeUser('ADMIN')
    renderApp(<AppRouter />, { route: '/dashboard' })
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard stub' })).toBeInTheDocument())
  })
})
