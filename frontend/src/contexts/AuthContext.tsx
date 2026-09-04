import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthState } from '../types'
import { authApi } from '../api/endpoints/auth.api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        try {
          const user = await authApi.getMe()
          localStorage.setItem('user', JSON.stringify(user))
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      } else {
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, user } = await authApi.login({ email, password })

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      setState({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    void authApi.logout().catch(() => undefined)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    setState((prev: AuthState) => ({ ...prev, user }))
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}