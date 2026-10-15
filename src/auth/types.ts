export interface AuthUser {
  id: string
  fullName: string
  email: string
  phone: string
}

export interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
}

export type AuthErrorField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'

export class AuthError extends Error {
  field?: AuthErrorField

  constructor(message: string, field?: AuthErrorField) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}
