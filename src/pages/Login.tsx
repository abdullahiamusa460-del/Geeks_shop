import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { readRememberedIdentifier } from '../auth/storage'
import { AuthError } from '../auth/types'
import './auth.css'

interface FieldErrors {
  identifier?: string
  password?: string
}

interface LoginState {
  from?: string
  justRegistered?: boolean
  email?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^(?:\+?234|0)[789]\d{9}$/

function isPhoneNumber(value: string) {
  return phonePattern.test(value.replace(/[\s-]/g, ''))
}

function validate(identifier: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const value = identifier.trim()

  if (!value) {
    errors.identifier = 'Please enter your email address or phone number.'
  } else if (!emailPattern.test(value) && !isPhoneNumber(value)) {
    errors.identifier =
      'Enter a valid email address or phone number, e.g. 0803 123 4567.'
  }

  if (!password) {
    errors.password = 'Please enter your password.'
  } else if (password.length < 6) {
    errors.password = 'Your password must be at least 6 characters.'
  }

  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const state = (location.state as LoginState | null) ?? null
  const redirectTo = state?.from ?? '/'
  const prefill = state?.email ?? readRememberedIdentifier()

  const [identifier, setIdentifier] = useState(prefill)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(
    () => prefill.length > 0 && prefill === readRememberedIdentifier(),
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateField = (field: keyof FieldErrors) => {
    const next = validate(identifier, password)
    setErrors((prev) => ({ ...prev, [field]: next[field] }))
  }

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setFormError('')
    const nextErrors = validate(identifier, password)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    setSubmitting(true)
    try {
      await login(identifier, password, rememberMe)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof AuthError) {
        const message = error.message
        setFormError(message)
        if (error.field === 'password') {
          setErrors((prev) => ({ ...prev, password: message }))
        }
      } else {
        setFormError('Something went wrong while signing in. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <Link to="/" className="auth-logo">
            GEEKS<span>SHOP</span>
          </Link>
          <h2>Pick up right where you left off.</h2>
          <ul className="auth-perks">
            <li>
              <span className="material-symbols-outlined">shopping_bag</span>
              Access your cart and saved wishlist
            </li>
            <li>
              <span className="material-symbols-outlined">redeem</span>
              Redeem codes and claim your rewards
            </li>
            <li>
              <span className="material-symbols-outlined">local_shipping</span>
              Track orders and delivery updates
            </li>
            <li>
              <span className="material-symbols-outlined">verified_user</span>
              Checkout faster with saved details
            </li>
          </ul>
          <p className="auth-aside-foot">
            Secure sign-in &middot; Your details stay private
          </p>
        </aside>

        <section className="auth-main">
          <div className="auth-card">
            <div className="auth-head">
              <span className="material-symbols-outlined auth-icon">
                lock
              </span>
              <h1>Welcome back</h1>
              <p>Sign in to your GeeksShop account to continue shopping.</p>
            </div>

            {state?.justRegistered && (
              <div className="auth-alert success" role="status">
                <span className="material-symbols-outlined">check_circle</span>
                <div>
                  <strong>Account created</strong>
                  <p>Your account is ready. Sign in to start shopping.</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="auth-alert" role="alert">
                <span className="material-symbols-outlined">error</span>
                <div>
                  <strong>We couldn&apos;t sign you in</strong>
                  <p>{formError}</p>
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="identifier">Email or phone number</label>
                <div
                  className={`auth-input-wrap ${errors.identifier ? 'has-error' : ''}`}
                >
                  <span className="material-symbols-outlined">
                    alternate_email
                  </span>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="you@geekshop.ng or 0803 123 4567"
                    value={identifier}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.identifier)}
                    aria-describedby={
                      errors.identifier ? 'identifier-error' : undefined
                    }
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      clearError('identifier')
                    }}
                    onBlur={() => validateField('identifier')}
                  />
                </div>
                {errors.identifier && (
                  <p className="auth-error" id="identifier-error" role="alert">
                    <span className="material-symbols-outlined">error</span>
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div
                  className={`auth-input-wrap ${errors.password ? 'has-error' : ''}`}
                >
                  <span className="material-symbols-outlined">lock</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    disabled={submitting}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError('password')
                    }}
                    onBlur={() => validateField('password')}
                  />
                  <button
                    type="button"
                    className="auth-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="auth-error" id="password-error" role="alert">
                    <span className="material-symbols-outlined">error</span>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={submitting}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Signing in&hellip;
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
