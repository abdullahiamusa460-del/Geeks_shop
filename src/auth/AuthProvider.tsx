import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import {
  clearSession,
  fetchCurrentUser,
  getStoredToken,
  saveSessionToken,
  setRememberedIdentifier,
  signIn,
  signUp,
} from './storage'
import type { AuthUser, RegisterInput } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function rehydrateSession() {
      if (!getStoredToken()) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        if (active) setUser(currentUser)
      } catch {
        clearSession()
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    rehydrateSession()

    const handleUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      active = false
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(
    async (identifier: string, password: string, remember: boolean) => {
      const { user: signedInUser, token } = await signIn(
        identifier,
        password,
        remember,
      )
      saveSessionToken(token, remember)
      setRememberedIdentifier(identifier, remember)
      setUser(signedInUser)
      return signedInUser
    },
    [],
  )

  const register = useCallback(async (input: RegisterInput) => {
    const { user: createdUser } = await signUp(input)
    return createdUser
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
