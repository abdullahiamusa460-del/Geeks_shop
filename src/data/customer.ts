import type { AuthUser } from '../auth/types'

export interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
}

export type CustomerInfoField = keyof CustomerInfo

export type CustomerInfoErrors = Partial<Record<CustomerInfoField, string>>

/** Order the fields are validated/announced in, and the tab order. */
export const customerInfoFieldOrder: CustomerInfoField[] = [
  'fullName',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'postalCode',
]

export const emptyCustomerInfo: CustomerInfo = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
}

/** Nigerian states + FCT, offered as suggestions for the "State or region" field. */
export const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
]

const STORAGE_KEY = 'geeks-shop:customer-info'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^(?:\+?234|0)[789]\d{9}$/
const postalPattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** Reads any previously saved checkout details (safe against bad storage). */
export function loadCustomerInfo(): CustomerInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...emptyCustomerInfo }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      fullName: asString(parsed.fullName),
      email: asString(parsed.email),
      phone: asString(parsed.phone),
      address: asString(parsed.address),
      city: asString(parsed.city),
      state: asString(parsed.state),
      postalCode: asString(parsed.postalCode),
    }
  } catch {
    return { ...emptyCustomerInfo }
  }
}

export function saveCustomerInfo(info: CustomerInfo): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fullName: info.fullName.trim(),
        email: info.email.trim(),
        phone: info.phone.trim(),
        address: info.address.trim(),
        city: info.city.trim(),
        state: info.state.trim(),
        postalCode: info.postalCode.trim(),
      }),
    )
  } catch {
    /* storage unavailable; keep going with in-memory values */
  }
}

/**
 * Merges saved checkout details with the signed-in account. Account identity
 * fields (name/email/phone) take precedence; delivery details come from the
 * last saved checkout.
 */
export function mergeCustomerInfo(
  saved: CustomerInfo,
  user: AuthUser | null,
): CustomerInfo {
  return {
    fullName: user?.fullName?.trim() || saved.fullName,
    email: user?.email?.trim() || saved.email,
    phone: user?.phone?.trim() || saved.phone,
    address: saved.address,
    city: saved.city,
    state: saved.state,
    postalCode: saved.postalCode,
  }
}

export function validateCustomerInfo(info: CustomerInfo): CustomerInfoErrors {
  const errors: CustomerInfoErrors = {}
  const fullName = info.fullName.trim()
  const email = info.email.trim()
  const phone = info.phone.trim()
  const address = info.address.trim()
  const city = info.city.trim()
  const state = info.state.trim()
  const postalCode = info.postalCode.trim()

  if (!fullName) {
    errors.fullName = 'Please enter your full name.'
  } else if (fullName.length < 2) {
    errors.fullName = 'Your name must be at least 2 characters.'
  } else if (!/[a-zA-Z]/.test(fullName)) {
    errors.fullName = 'Please enter your name using letters.'
  }

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address, e.g. you@geeksshop.ng.'
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.'
  } else if (!phonePattern.test(phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter a valid phone number, e.g. 0803 123 4567.'
  }

  if (!address) {
    errors.address = 'Please enter your delivery address.'
  } else if (address.length < 5) {
    errors.address = 'Your address looks too short — add a street and number.'
  }

  if (!city) {
    errors.city = 'Please enter your city.'
  } else if (city.length < 2) {
    errors.city = 'Please enter a valid city.'
  }

  if (!state) {
    errors.state = 'Please enter your state or region.'
  } else if (state.length < 2) {
    errors.state = 'Please enter a valid state or region.'
  }

  // Postal code is optional ("if applicable"), but must be well-formed.
  if (postalCode && !postalPattern.test(postalCode)) {
    errors.postalCode = 'Enter a valid postal code, e.g. 101233.'
  }

  return errors
}
