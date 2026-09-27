import { createContext, useContext } from 'react'
import type { AuthUser, RegisterInput } from './types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (
    identifier: string,
    password: string,
    remember: boolean,
  ) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
