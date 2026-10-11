import type { CartItem } from '../context/CartContext'
import { getTrustedUnitPrice } from './products'

/**
 * Flat delivery fee applied at checkout (in Naira).
 * Waived entirely once the order subtotal reaches FREE_DELIVERY_THRESHOLD.
 */
export const DELIVERY_FEE = 2500

/** Orders at or above this subtotal qualify for free delivery. */
export const FREE_DELIVERY_THRESHOLD = 150000

export interface OrderTotals {
  /** Total number of units in the cart (not the number of distinct lines). */
  itemCount: number
  /** Sum of every line's price × quantity. Never taken from user input. */
  subtotal: number
  /** Delivery charged for this order (0 when waived or the cart is empty). */
  deliveryFee: number
  /** True when the order qualifies for free delivery. */
  deliveryWaived: boolean
  /** subtotal + deliveryFee. */
  total: number
}

/**
 * Unit price for a cart line, resolved from the trusted product catalog. Only
 * falls back to the stored value if the product is no longer in the catalog,
 * so a tampered/outdated stored price can never set the amount charged.
 */
export function resolveUnitPrice(item: CartItem): number {
  return getTrustedUnitPrice(item.product.id) ?? item.product.price
}

/**
 * Derives every monetary figure for an order from the cart line items, so the
 * summary can never drift from the current cart contents.
 */
export function calculateOrderTotals(items: CartItem[]): OrderTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = Math.round(
    items.reduce(
      (sum, item) => sum + resolveUnitPrice(item) * item.quantity,
      0,
    ),
  )
  const hasItems = items.length > 0
  const deliveryWaived = hasItems && subtotal >= FREE_DELIVERY_THRESHOLD
  const deliveryFee = hasItems && !deliveryWaived ? DELIVERY_FEE : 0

  return {
    itemCount,
    subtotal,
    deliveryFee,
    deliveryWaived,
    total: subtotal + deliveryFee,
  }
}

/** Amount a customer still needs to spend to unlock free delivery. */
export function amountUntilFreeDelivery(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
}
