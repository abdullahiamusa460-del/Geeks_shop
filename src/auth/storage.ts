import { AuthError, type AuthUser, type RegisterInput } from './types'

const ACCOUNTS_KEY = 'geeks-shop.accounts'
const SESSION_KEY = 'geeks-shop.session'
const REMEMBER_KEY = 'geeks-shop.remembered-identifier'

interface StoredAccount extends AuthUser {
  passwordHash: string
  salt: string
}

function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function weakFallbackHash(value: string) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return `fb${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`
}

async function hashPassword(password: string, salt: string) {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return weakFallbackHash(`${salt}:${password}`)
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length === 13) return `0${digits.slice(3)}`
  return digits
}

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

function readAccounts(): StoredAccount[] {
  return readJson<StoredAccount[]>(localStorage, ACCOUNTS_KEY, [])
}

function findAccount(identifier: string) {
  const email = normalizeEmail(identifier)
  const phone = normalizePhone(identifier)
  return readAccounts().find(
    (account) => account.email === email || account.phone === phone,
  )
}

export function readRememberedIdentifier() {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? ''
  } catch {
    return ''
  }
}

export function readSession(): AuthUser | null {
  const inTab = readJson<AuthUser | null>(sessionStorage, SESSION_KEY, null)
  if (inTab) return inTab
  return readJson<AuthUser | null>(localStorage, SESSION_KEY, null)
}

function toPublicUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
  }
}

function startSession(account: StoredAccount, remember: boolean) {
  const safeUser = toPublicUser(account)
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage unavailable */
  }
  writeJson(remember ? localStorage : sessionStorage, SESSION_KEY, safeUser)
  try {
    if (remember) localStorage.setItem(REMEMBER_KEY, account.email)
    else localStorage.removeItem(REMEMBER_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function endSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(REMEMBER_KEY)
  } catch {
    /* storage unavailable */
  }
}

export async function signUp(input: RegisterInput): Promise<AuthUser> {
  const email = normalizeEmail(input.email)
  const phone = normalizePhone(input.phone)
  const accounts = readAccounts()

  if (accounts.some((account) => account.email === email)) {
    throw new AuthError(
      'An account with this email already exists. Try logging in.',
      'email',
    )
  }
  if (accounts.some((account) => account.phone === phone)) {
    throw new AuthError(
      'An account with this phone number already exists. Try logging in.',
      'phone',
    )
  }

  const salt = randomHex(16)
  const passwordHash = await hashPassword(input.password, salt)
  const account: StoredAccount = {
    id: randomHex(8),
    fullName: input.fullName.trim(),
    email,
    phone,
    salt,
    passwordHash,
  }

  writeJson(localStorage, ACCOUNTS_KEY, [...accounts, account])
  return toPublicUser(account)
}

export async function signIn(
  identifier: string,
  password: string,
  remember: boolean,
): Promise<AuthUser> {
  const account = findAccount(identifier)

  if (!account) {
    throw new AuthError(
      'We could not find an account with those details. Check your email or phone number, or create an account.',
    )
  }

  const attempt = await hashPassword(password, account.salt)
  if (attempt !== account.passwordHash) {
    throw new AuthError(
      'The password you entered is incorrect. Please try again or reset your password.',
      'password',
    )
  }

  startSession(account, remember)
  return toPublicUser(account)
}
