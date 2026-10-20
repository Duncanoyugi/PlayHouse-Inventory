import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { User, AuthState } from '../types'
import { authApi } from '../api/endpoints/auth.api'
import { AUTH_EXPIRED_EVENT, tokenStorage } from '../utils/storage-utils'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const signedOut: AuthState = { user: null, token: null, isAuthenticated: false, isLoading: false }

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>(() => (tokenStorage.get() ? { ...signedOut, isLoading: true } : signedOut))

  // Restore the session on first load by asking the server who the token belongs to.
  useEffect(() => {
    let cancelled = false
    const token = tokenStorage.get()
    if (!token) return
    authApi
      .getMe()
      .then((user) => {
        if (!cancelled) setState({ user, token, isAuthenticated: true, isLoading: false })
      })
      .catch(() => {
        tokenStorage.clear()
        if (!cancelled) setState(signedOut)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // The API client fires this when the server rejects the token (expired / account disabled).
  useEffect(() => {
    const onExpired = () => {
      queryClient.clear()
      setState(signedOut)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [queryClient])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authApi.login({ email, password })
    tokenStorage.set(accessToken)
    setState({ user, token: accessToken, isAuthenticated: true, isLoading: false })
    return user
  }, [])

  const logout = useCallback(() => {
    void authApi.logout().catch(() => undefined)
    tokenStorage.clear()
    queryClient.clear() // never leave one user's data cached for the next person
    setState(signedOut)
  }, [queryClient])

  const setUser = useCallback((user: User) => setState((prev) => ({ ...prev, user })), [])

  const value = useMemo(() => ({ ...state, login, logout, setUser }), [state, login, logout, setUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
