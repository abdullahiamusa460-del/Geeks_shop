import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { AuthError } from '../auth/types'
import './auth.css'
import './Register.css'

interface FieldErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

type FieldName = keyof FieldErrors

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^(?:\+?234|0)[789]\d{9}$/

const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

function isPhoneNumber(value: string) {
  return phonePattern.test(value.replace(/[\s-]/g, ''))
}

function getStrength(password: string) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score += 1
  else if (/\d/.test(password) || /[^\w\s]/.test(password)) score += 0.5
  return Math.min(Math.round(score), 4)
}

function validate(values: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  terms: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const { password, confirmPassword, terms } = values

  if (!fullName) {
    errors.fullName = 'Please enter your full name.'
  } else if (fullName.length < 2) {
    errors.fullName = 'Your name must be at least 2 characters.'
  } else if (!/[a-zA-Z]/.test(fullName)) {
    errors.fullName = 'Please enter your real name using letters.'
  }

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address, e.g. you@geeksshop.ng.'
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.'
  } else if (!isPhoneNumber(phone)) {
    errors.phone = 'Enter a valid phone number, e.g. 0803 123 4567.'
  }

  if (!password) {
    errors.password = 'Please create a password.'
  } else if (password.length < 8) {
    errors.password = 'Your password must be at least 8 characters.'
  } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Your password needs at least one letter and one number.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Your passwords do not match. Please try again.'
  }

  if (!terms) {
    errors.terms = 'Please accept the Terms & Conditions to continue.'
  }

  return errors
}

function Aside() {
  return (
    <aside className="auth-aside">
      <Link to="/" className="auth-logo">
        GEEKS<span>SHOP</span>
      </Link>
      <h2>One account, every perk.</h2>
      <ul className="auth-perks">
        <li>
          <span className="material-symbols-outlined">shopping_bag</span>
          Checkout in seconds with saved details
        </li>
        <li>
          <span className="material-symbols-outlined">redeem</span>
          Hold your redemption codes and rewards
        </li>
        <li>
          <span className="material-symbols-outlined">favorite</span>
          Wishlist and order tracking in one place
        </li>
        <li>
          <span className="material-symbols-outlined">notifications</span>
          Restock alerts before anything sells out
        </li>
      </ul>
      <p className="auth-aside-foot">Free to join &middot; No hidden fees</p>
    </aside>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(false)

  const strength = getStrength(password)
  const currentValues = {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    terms,
  }

  const validateField = (field: FieldName) => {
    const next = validate(currentValues)
    setErrors((prev) => ({ ...prev, [field]: next[field] }))
  }

  const clearError = (field: FieldName) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setFormError('')
    const nextErrors = validate(currentValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    setSubmitting(true)
    try {
      await register({ fullName, email, phone, password })
      setCreated(true)
    } catch (error) {
      if (error instanceof AuthError && error.field) {
        setErrors({ [error.field]: error.message })
      } else {
        setFormError(
          'We could not create your account right now. Please try again.',
        )
      }
      setSubmitting(false)
    }
  }

  const goToLogin = () => {
    navigate('/login', {
      replace: true,
      state: { justRegistered: true, email: email.trim().toLowerCase() },
    })
  }

  const firstName = fullName.trim().split(' ')[0]

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Aside />

        <section className="auth-main">
          {created ? (
            <div className="auth-card register-success">
              <span className="material-symbols-outlined auth-icon">
                check_circle
              </span>
              <h1>Account created</h1>
              <p>
                Welcome to GeeksShop{firstName ? `, ${firstName}` : ''}. Your
                account is ready — sign in to start shopping.
              </p>
              <button
                type="button"
                className="auth-submit"
                onClick={goToLogin}
              >
                Continue to Login
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="auth-card register-card">
              <div className="auth-head">
                <span className="material-symbols-outlined auth-icon">
                  person_add
                </span>
                <h1>Create your account</h1>
                <p>
                  It takes less than a minute. Start shopping, redeem codes and
                  track your orders in one place.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {formError && (
                  <div className="auth-alert" role="alert">
                    <span className="material-symbols-outlined">error</span>
                    <div>
                      <strong>We couldn&apos;t create your account</strong>
                      <p>{formError}</p>
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="fullName">Full name</label>
                  <div
                    className={`auth-input-wrap ${errors.fullName ? 'has-error' : ''}`}
                  >
                    <span className="material-symbols-outlined">person</span>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Chidi Okonkwo"
                      value={fullName}
                      disabled={submitting}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={
                        errors.fullName ? 'fullName-error' : undefined
                      }
                      onChange={(e) => {
                        setFullName(e.target.value)
                        clearError('fullName')
                      }}
                      onBlur={() => validateField('fullName')}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="auth-error" id="fullName-error" role="alert">
                      <span className="material-symbols-outlined">error</span>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="email">Email address</label>
                  <div
                    className={`auth-input-wrap ${errors.email ? 'has-error' : ''}`}
                  >
                    <span className="material-symbols-outlined">mail</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@geeksshop.ng"
                      value={email}
                      disabled={submitting}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? 'email-error' : undefined
                      }
                      onChange={(e) => {
                        setEmail(e.target.value)
                        clearError('email')
                      }}
                      onBlur={() => validateField('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="auth-error" id="email-error" role="alert">
                      <span className="material-symbols-outlined">error</span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="phone">Phone number</label>
                  <div
                    className={`auth-input-wrap ${errors.phone ? 'has-error' : ''}`}
                  >
                    <span className="material-symbols-outlined">call</span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0803 123 4567"
                      value={phone}
                      disabled={submitting}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? 'phone-error' : undefined
                      }
                      onChange={(e) => {
                        setPhone(e.target.value)
                        clearError('phone')
                      }}
                      onBlur={() => validateField('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="auth-error" id="phone-error" role="alert">
                      <span className="material-symbols-outlined">error</span>
                      {errors.phone}
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
                      autoComplete="new-password"
                      placeholder="Create a password"
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

                  {password && (
                    <div className="strength">
                      <div className="strength-bar" aria-hidden="true">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`strength-seg s${strength} ${
                              step <= strength ? 'on' : ''
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`strength-label s${strength}`}
                        role="status"
                        aria-live="polite"
                      >
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div
                    className={`auth-input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}
                  >
                    <span className="material-symbols-outlined">lock_reset</span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      disabled={submitting}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? 'confirmPassword-error'
                          : undefined
                      }
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        clearError('confirmPassword')
                      }}
                      onBlur={() => validateField('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="auth-toggle"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      aria-pressed={showConfirm}
                    >
                      <span className="material-symbols-outlined">
                        {showConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      className="auth-error"
                      id="confirmPassword-error"
                      role="alert"
                    >
                      <span className="material-symbols-outlined">error</span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="terms-block">
                  <label className="auth-check">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={terms}
                      disabled={submitting}
                      aria-invalid={Boolean(errors.terms)}
                      aria-describedby={errors.terms ? 'terms-error' : undefined}
                      onChange={(e) => {
                        setTerms(e.target.checked)
                        clearError('terms')
                      }}
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms" className="auth-link">
                        Terms &amp; Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="auth-link">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="auth-error" id="terms-error" role="alert">
                      <span className="material-symbols-outlined">error</span>
                      {errors.terms}
                    </p>
                  )}
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
                      Creating account&hellip;
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
