import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import { endSession, readSession, signIn, signUp } from './storage'
import type { AuthUser, RegisterInput } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSession)

  const login = useCallback(
    async (identifier: string, password: string, remember: boolean) => {
      const signedIn = await signIn(identifier, password, remember)
      setUser(signedIn)
      return signedIn
    },
    [],
  )

  const register = useCallback(async (input: RegisterInput) => {
    const created = await signUp(input)
    setUser(null)
    return created
  }, [])

  const logout = useCallback(() => {
    endSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
