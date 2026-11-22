import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import type { User } from '../types'

export const makeUser = (role: User['role']): User => ({
  id: role === 'ADMIN' ? 'u-admin' : 'u-keeper',
  email: `${role.toLowerCase()}@playhouse.co.ke`,
  fullName: role === 'ADMIN' ? 'Mary Manager' : 'Kevin Keeper',
  role,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

export function renderApp(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}
