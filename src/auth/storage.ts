import { apiClient, REMEMBER_KEY, TOKEN_KEY } from '../api/client'
import type { AuthResponse } from '../types/api'
import type { AuthUser, RegisterInput } from './types'

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveSessionToken(token: string, remember: boolean): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    if (remember) localStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function readRememberedIdentifier(): string {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setRememberedIdentifier(
  identifier: string,
  remember: boolean,
): void {
  try {
    if (remember && identifier) localStorage.setItem(REMEMBER_KEY, identifier)
    else localStorage.removeItem(REMEMBER_KEY)
  } catch {
    /* storage unavailable */
  }
}

export async function signUp(
  input: RegisterInput,
): Promise<{ user: AuthUser; token: string }> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', input)
  return { user: data.user, token: data.token }
}

export async function signIn(
  identifier: string,
  password: string,
  remember: boolean,
): Promise<{ user: AuthUser; token: string }> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', {
    identifier,
    password,
    remember,
  })
  return { user: data.user, token: data.token }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
  return data.user
}
