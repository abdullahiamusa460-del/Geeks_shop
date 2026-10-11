import type { CartItem } from '../context/CartContext'
import type { CustomerInfo } from '../data/customer'
import { getTrustedUnitPrice } from '../data/products'
import { calculateOrderTotals } from '../data/pricing'

/**
 * Order persistence adapter.
 *
 * IMPORTANT — what exists vs. what is documented:
 * `system documentation.md` (§22–23) specifies a real backend — a
 * `POST /api/orders` endpoint backed by `orders` + `order_items` tables. That
 * backend does NOT exist in this repository. The app is a client-only Vite +
 * React SPA and localStorage is its de-facto database (see `auth/storage.ts`
 * and `context/NotificationsContext.tsx`, which carries the same note).
 *
 * This module is the single seam where orders are written. It mirrors the
 * documented contract and column names so it can be replaced by a real
 * `fetch('/api/orders', ...)` call without the UI changing. It is intentionally
 * async and may throw, so the UI never reports success before the write
 * actually happens.
 */

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

/** Mirrors the documented `order_items` table. */
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  image: string
  quantity: number
  unitPrice: number
  subtotal: number
}

/** Mirrors the documented `orders` table, plus the delivery snapshot. */
export interface Order {
  id: string
  userId: string | null
  subtotal: number
  discount: number
  shipping: number
  total: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  /** Snapshot of the delivery/contact details captured at checkout. */
  customer: CustomerInfo
  items: OrderItem[]
  /** Idempotency guard so a retried submission cannot create two orders. */
  idempotencyKey: string
}

export interface CreateOrderInput {
  userId: string | null
  items: CartItem[]
  customer: CustomerInfo
  /** Client-generated key; the same key never creates a second order. */
  idempotencyKey: string
}

export type OrderErrorCode =
  | 'EMPTY_CART'
  | 'INVALID_ITEM'
  | 'STORAGE_UNAVAILABLE'

export class OrderError extends Error {
  code: OrderErrorCode

  constructor(message: string, code: OrderErrorCode) {
    super(message)
    this.name = 'OrderError'
    this.code = code
  }
}

export const ORDERS_STORAGE_KEY = 'geeks-shop:orders'

function randomSuffix(length = 6): string {
  const bytes = new Uint8Array(length)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return Math.random().toString(36).slice(2, 2 + length)
}

/** A stable, unique key per checkout attempt (retries reuse it). */
export function generateIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `idem_${randomSuffix(16)}`
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false
  const order = value as Record<string, unknown>
  return (
    typeof order.id === 'string' &&
    typeof order.total === 'number' &&
    Array.isArray(order.items) &&
    typeof order.idempotencyKey === 'string'
  )
}

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isOrder) : []
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Surface this to the caller so the UI can show a real failure instead of
    // pretending the order was placed.
    throw new OrderError(
      'We could not save your order on this device. Please check your browser storage settings and try again.',
      'STORAGE_UNAVAILABLE',
    )
  }
}

function nextOrderId(existing: Order[]): string {
  const used = new Set(existing.map((order) => order.id))
  let id: string
  do {
    id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`
  } while (used.has(id))
  return id
}

/**
 * Creates an order. Prices are recomputed from the cart lines here — never
 * taken from the UI — so the stored totals always match the items.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!input.items.length) {
    throw new OrderError(
      'Your cart is empty. Add an item before placing an order.',
      'EMPTY_CART',
    )
  }

  const invalidItem = input.items.find(
    (item) =>
      !item.product.id ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1 ||
      // Validate against the trusted catalog price, not the submitted one.
      (getTrustedUnitPrice(item.product.id) ?? item.product.price) <= 0,
  )
  if (invalidItem) {
    throw new OrderError(
      `Some items in your cart have invalid details (${invalidItem.product.name || 'unknown item'}). Please review your cart and try again.`,
      'INVALID_ITEM',
    )
  }

  const existing = readOrders()

  // Idempotency: a repeated submission with the same key returns the original
  // order instead of creating a duplicate.
  const alreadyPlaced = existing.find(
    (order) => order.idempotencyKey === input.idempotencyKey,
  )
  if (alreadyPlaced) return alreadyPlaced

  const { subtotal, deliveryFee, total } = calculateOrderTotals(input.items)
  const orderId = nextOrderId(existing)
  const createdAt = new Date().toISOString()

  const items: OrderItem[] = input.items.map((item) => {
    // Price comes from the trusted catalog, never the submitted value.
    const unitPrice = getTrustedUnitPrice(item.product.id) ?? item.product.price
    return {
      id: `itm_${randomSuffix(8)}`,
      orderId,
      productId: item.product.id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      unitPrice,
      subtotal: Math.round(unitPrice * item.quantity),
    }
  })

  const order: Order = {
    id: orderId,
    userId: input.userId,
    subtotal,
    discount: 0,
    shipping: deliveryFee,
    total,
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt,
    customer: { ...input.customer },
    items,
    idempotencyKey: input.idempotencyKey,
  }

  // Persist first; only resolve once the write has actually succeeded.
  writeOrders([order, ...existing])
  return order
}

export async function listOrders(userId?: string | null): Promise<Order[]> {
  const orders = readOrders().sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )
  return userId ? orders.filter((order) => order.userId === userId) : orders
}

export async function getOrder(id: string): Promise<Order | null> {
  return readOrders().find((order) => order.id === id) ?? null
}
