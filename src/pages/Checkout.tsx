import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../data/products'
import { amountUntilFreeDelivery, calculateOrderTotals } from '../data/pricing'
import {
  createOrder,
  generateIdempotencyKey,
  OrderError,
  type Order,
  type OrderStatus,
} from '../api/orders'
import {
  customerInfoFieldOrder,
  loadCustomerInfo,
  mergeCustomerInfo,
  nigerianStates,
  saveCustomerInfo,
  validateCustomerInfo,
  type CustomerInfo,
  type CustomerInfoErrors,
  type CustomerInfoField,
} from '../data/customer'
import './Checkout.css'

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending payment',
  PAYMENT_PENDING: 'Payment pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface CheckoutFieldProps {
  field: CustomerInfoField
  label: string
  value: string
  error?: string
  onValueChange: (value: string) => void
  onFieldBlur: () => void
  optional?: boolean
  full?: boolean
  type?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
  autoComplete?: string
  placeholder?: string
  list?: string
}

function CheckoutField({
  field,
  label,
  value,
  error,
  onValueChange,
  onFieldBlur,
  optional,
  full,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  list,
}: CheckoutFieldProps) {
  const id = `checkout-${field}`
  const errorId = `${id}-error`

  return (
    <div
      className={`checkout-field${full ? ' full' : ''}${error ? ' has-error' : ''}`}
    >
      <label htmlFor={id}>
        <span className="checkout-label-text">
          {label}
          {!optional && (
            <span className="checkout-required" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {optional && <span className="checkout-optional">Optional</span>}
      </label>
      <input
        id={id}
        name={field}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        list={list}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onFieldBlur}
      />
      {error && (
        <p className="checkout-error" id={errorId} role="alert">
          <span className="material-symbols-outlined">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default function Checkout() {
  const { items, clearCart } = useCart()
  const { user } = useAuth()

  // Reuse saved checkout details, topped up with the account's identity.
  const [info, setInfo] = useState<CustomerInfo>(() =>
    mergeCustomerInfo(loadCustomerInfo(), user),
  )
  const [errors, setErrors] = useState<CustomerInfoErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  // Guards against double-submits and keeps one idempotency key per attempt.
  const submitLock = useRef(false)
  const idempotencyKeyRef = useRef('')

  // Every figure below is derived from the current cart lines — never from
  // stored or manually entered totals.
  const { itemCount, subtotal, deliveryFee, deliveryWaived, total } =
    calculateOrderTotals(items)
  const untilFreeDelivery = amountUntilFreeDelivery(subtotal)
  const errorCount = customerInfoFieldOrder.filter((field) => errors[field]).length

  // Once the order is saved we show a confirmation — checked before the empty
  // cart guard because placing an order clears the cart.
  if (placedOrder) {
    const units = placedOrder.items.reduce((sum, item) => sum + item.quantity, 0)
    const firstName = placedOrder.customer.fullName.trim().split(' ')[0]
    return (
      <main className="checkout-page">
        <div className="checkout-confirm">
          <span className="material-symbols-outlined checkout-confirm-icon">
            check_circle
          </span>
          <h1>Order confirmed</h1>
          <p className="checkout-confirm-lead">
            Thanks{firstName ? `, ${firstName}` : ''}. We&apos;ve received your
            order and it&apos;s awaiting payment.
          </p>

          <dl className="checkout-confirm-facts">
            <div>
              <dt>Order number</dt>
              <dd>{placedOrder.id}</dd>
            </div>
            <div>
              <dt>Order date</dt>
              <dd>{formatOrderDate(placedOrder.createdAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="checkout-status">
                  {orderStatusLabels[placedOrder.orderStatus]}
                </span>
              </dd>
            </div>
          </dl>

          <div className="checkout-confirm-receipt">
            <h2 className="checkout-confirm-items-title">
              Your items ({units})
            </h2>
            <ul className="checkout-confirm-items">
              {placedOrder.items.map((item) => (
                <li key={item.id} className="checkout-confirm-item">
                  <div className="checkout-confirm-item-img">
                    <img src={item.image} alt={item.name} />
                    <span className="checkout-summary-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-confirm-item-info">
                    <span className="checkout-confirm-item-name">
                      {item.name}
                    </span>
                    <span className="checkout-confirm-item-unit">
                      {formatNaira(item.unitPrice)} × {item.quantity}
                    </span>
                  </div>
                  <span className="checkout-confirm-item-line">
                    {formatNaira(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="checkout-confirm-totals">
              <div className="checkout-confirm-total-row">
                <span>Subtotal</span>
                <span>{formatNaira(placedOrder.subtotal)}</span>
              </div>
              <div className="checkout-confirm-total-row">
                <span>Delivery fee</span>
                {placedOrder.shipping > 0 ? (
                  <span>{formatNaira(placedOrder.shipping)}</span>
                ) : (
                  <span className="checkout-summary-free">Free</span>
                )}
              </div>
              <div className="checkout-confirm-total-row grand">
                <span>Total</span>
                <strong>{formatNaira(placedOrder.total)}</strong>
              </div>
            </div>
          </div>

          <div className="checkout-confirm-actions">
            <Link to="/shop" className="checkout-empty-btn">
              Continue Shopping
            </Link>
            <Link to="/" className="checkout-empty-link">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // An empty cart is guarded explicitly so the summary can't show stale data.
  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span className="material-symbols-outlined">remove_shopping_cart</span>
          <h1>Your cart is empty</h1>
          <p>Add a few pieces to your bag before heading to checkout.</p>
          <div className="checkout-empty-actions">
            <Link to="/shop" className="checkout-empty-btn">
              Continue Shopping
            </Link>
            <Link to="/cart" className="checkout-empty-link">
              Back to cart
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const setField = (field: CustomerInfoField, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const validateField = (field: CustomerInfoField) => {
    const next = validateCustomerInfo(info)
    setErrors((prev) => ({ ...prev, [field]: next[field] }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Ignore re-entrant submissions (double click / Enter held down).
    if (submitLock.current || submitting) return

    setAttempted(true)
    setOrderError('')

    // 1. Customer information
    const nextErrors = validateCustomerInfo(info)
    setErrors(nextErrors)
    const firstInvalid = customerInfoFieldOrder.find(
      (field) => nextErrors[field],
    )
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus()
      return
    }

    // 2. Cart contents
    if (items.length === 0) {
      setOrderError('Your cart is empty. Add an item before placing an order.')
      return
    }
    const invalidItem = items.find(
      (item) =>
        !item.product.id || item.product.price <= 0 || item.quantity < 1,
    )
    if (invalidItem) {
      setOrderError(
        `"${invalidItem.product.name}" has invalid details. Please review your cart and try again.`,
      )
      return
    }

    // 3. Place the order exactly once, and only report success if the write
    //    actually succeeds.
    submitLock.current = true
    setSubmitting(true)
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateIdempotencyKey()
    }

    try {
      const order = await createOrder({
        userId: user?.id ?? null,
        items,
        customer: info,
        idempotencyKey: idempotencyKeyRef.current,
      })
      saveCustomerInfo(info)
      idempotencyKeyRef.current = ''
      clearCart()
      setPlacedOrder(order)
    } catch (error) {
      // Keep the same idempotency key so a retry can't create a duplicate.
      setOrderError(
        error instanceof OrderError
          ? error.message
          : 'We could not place your order right now. Please try again.',
      )
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <main className="checkout-page">
      <section className="checkout-topbar">
        <div className="checkout-topbar-inner">
          <div className="checkout-steps">
            <Link to="/cart">Bag ({itemCount})</Link>
            <span className="material-symbols-outlined">chevron_right</span>
            <span className="active">Information</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <span className="muted">Payment</span>
          </div>
          <div className="checkout-secure">
            <span className="material-symbols-outlined">lock</span>
            Secure checkout
          </div>
        </div>
      </section>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="checkout-card">
            <div className="checkout-card-head">
              <span className="checkout-step">1</span>
              <h2>Contact Information</h2>
            </div>

            {user && (
              <p className="checkout-account-note">
                <span className="material-symbols-outlined">person</span>
                We&apos;ve filled in your account details. Update anything
                that&apos;s changed.
              </p>
            )}

            {attempted && errorCount > 0 && (
              <div className="checkout-alert" role="alert">
                <span className="material-symbols-outlined">error</span>
                <div>
                  <strong>Please review the highlighted fields</strong>
                  <p>
                    {errorCount} {errorCount === 1 ? 'field needs' : 'fields need'}{' '}
                    your attention before you can place the order.
                  </p>
                </div>
              </div>
            )}

            <CheckoutField
              field="fullName"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Chidi Okonkwo"
              value={info.fullName}
              error={errors.fullName}
              onValueChange={(value) => setField('fullName', value)}
              onFieldBlur={() => validateField('fullName')}
            />
            <CheckoutField
              field="email"
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@geeksshop.ng"
              value={info.email}
              error={errors.email}
              onValueChange={(value) => setField('email', value)}
              onFieldBlur={() => validateField('email')}
            />
            <CheckoutField
              field="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 123 4567"
              value={info.phone}
              error={errors.phone}
              onValueChange={(value) => setField('phone', value)}
              onFieldBlur={() => validateField('phone')}
            />
          </section>

          <section className="checkout-card">
            <div className="checkout-card-head">
              <span className="checkout-step">2</span>
              <h2>Delivery Information</h2>
            </div>
            <div className="checkout-grid">
              <CheckoutField
                field="address"
                label="Delivery address"
                full
                autoComplete="street-address"
                placeholder="15 Adeola Odeku Street, Victoria Island"
                value={info.address}
                error={errors.address}
                onValueChange={(value) => setField('address', value)}
                onFieldBlur={() => validateField('address')}
              />
              <CheckoutField
                field="city"
                label="City"
                autoComplete="address-level2"
                placeholder="Lagos"
                value={info.city}
                error={errors.city}
                onValueChange={(value) => setField('city', value)}
                onFieldBlur={() => validateField('city')}
              />
              <CheckoutField
                field="state"
                label="State or region"
                autoComplete="address-level1"
                placeholder="Lagos"
                list="ng-states"
                value={info.state}
                error={errors.state}
                onValueChange={(value) => setField('state', value)}
                onFieldBlur={() => validateField('state')}
              />
              <CheckoutField
                field="postalCode"
                label="Postal code"
                optional
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="101233"
                value={info.postalCode}
                error={errors.postalCode}
                onValueChange={(value) => setField('postalCode', value)}
                onFieldBlur={() => validateField('postalCode')}
              />
            </div>
            <datalist id="ng-states">
              {nigerianStates.map((state) => (
                <option key={state} value={state} />
              ))}
            </datalist>
          </section>

          <button
            type="submit"
            className="checkout-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="checkout-spinner" aria-hidden="true" />
                Placing order&hellip;
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">lock</span>
                Place Order · {formatNaira(total)}
              </>
            )}
          </button>

          {orderError && (
            <div className="checkout-alert" role="alert">
              <span className="material-symbols-outlined">error</span>
              <div>
                <strong>Order not placed</strong>
                <p>{orderError}</p>
              </div>
            </div>
          )}
        </form>

        <aside className="checkout-summary" aria-label="Order summary">
          <div className="checkout-summary-head">
            <h2>Order Summary</h2>
            <Link to="/cart">Edit bag</Link>
          </div>

          <ul className="checkout-summary-list">
            {items.map((item) => (
              <li key={item.product.id} className="checkout-summary-item">
                <div className="checkout-summary-img">
                  <img src={item.product.image} alt={item.product.name} />
                  <span className="checkout-summary-qty">{item.quantity}</span>
                </div>
                <div className="checkout-summary-info">
                  <span className="checkout-summary-name">
                    {item.product.name}
                  </span>
                  <span className="checkout-summary-unit">
                    {formatNaira(item.product.price)} × {item.quantity}
                  </span>
                </div>
                <span className="checkout-summary-line">
                  {formatNaira(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-row">
            <span>
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span>{formatNaira(subtotal)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Delivery fee</span>
            {deliveryWaived ? (
              <span className="checkout-summary-free">Free</span>
            ) : (
              <span>{formatNaira(deliveryFee)}</span>
            )}
          </div>

          {!deliveryWaived && untilFreeDelivery > 0 && (
            <p className="checkout-summary-hint">
              Add {formatNaira(untilFreeDelivery)} more to unlock free delivery.
            </p>
          )}

          <div className="checkout-summary-divider" />

          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>{formatNaira(total)}</strong>
          </div>

          <Link to="/cart" className="checkout-back">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  )
}
