import type { CartItem } from '../context/CartContext'
import type { CustomerInfo } from '../data/customer'

/**
 * Order API client.
 *
 * Orders are created by the GeeksShop API (`POST /api/orders`; see the
 * `server/` service). The server re-prices every line from its own trusted
 * catalog, so only product ids and quantities are sent — any price held in the
 * client cart is ignored. Because the write happens server-side, checkout only
 * reports success once the order has actually been persisted.
 *
 * Requests are same-origin by default: the Vite dev server proxies `/api` to
 * the API (see `vite.config.ts`). Point `VITE_API_URL` at the API origin to
 * call it directly instead (e.g. in a production build).
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

/** A purchased line, as returned by the API. */
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

/** An order, as returned by the API. */
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
  /**
   * Kept for callers, but not transmitted: the API links an order to the
   * signed-in user via the auth token, when one is present. The local-only
   * auth in this app sends no token, so orders are recorded as guest orders.
   */
  userId: string | null
  items: CartItem[]
  customer: CustomerInfo
  /** Client-generated key; the same key never creates a second order. */
  idempotencyKey: string
}

export type OrderErrorCode =
  | 'EMPTY_CART'
  | 'INVALID_ITEM'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'

export class OrderError extends Error {
  code: OrderErrorCode
  /** HTTP status of the failed request, when there was a response. */
  status?: number

  constructor(message: string, code: OrderErrorCode, status?: number) {
    super(message)
    this.name = 'OrderError'
    this.code = code
    this.status = status
  }
}

const RAW_API_URL = import.meta.env.VITE_API_URL
/** API origin, or '' to use the same origin (the Vite dev proxy). */
export const API_BASE_URL = (
  typeof RAW_API_URL === 'string' ? RAW_API_URL : ''
).replace(/\/+$/, '')

const ORDERS_PATH = '/api/orders'

const NETWORK_ERROR_MESSAGE =
  'We could not reach the order service. Check your connection and try again.'
const DEFAULT_ERROR_MESSAGE =
  'We could not place your order right now. Please try again.'

function randomSuffix(length = 6): string {
  const bytes = new Uint8Array(length)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
}

/** A stable, unique key per checkout attempt (retries reuse it). */
export function generateIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `idem_${randomSuffix(16)}`
}

function readMessage(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message?: unknown }
    if (typeof message === 'string' && message.trim()) return message
  }
  return null
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/** Performs a JSON request, translating any failure into an `OrderError`. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    // The server could not be reached (offline, down, or blocked).
    throw new OrderError(NETWORK_ERROR_MESSAGE, 'NETWORK_ERROR')
  }

  const payload = await readJson(response)

  if (!response.ok) {
    throw new OrderError(
      readMessage(payload) ?? DEFAULT_ERROR_MESSAGE,
      response.status >= 500 ? 'SERVER_ERROR' : 'INVALID_ITEM',
      response.status,
    )
  }

  return payload as T
}

/**
 * Creates an order. Only ids and quantities are sent — totals are computed by
 * the server from the trusted catalog.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!input.items.length) {
    throw new OrderError(
      'Your cart is empty. Add an item before placing an order.',
      'EMPTY_CART',
    )
  }

  const data = await request<{ order?: Order }>(ORDERS_PATH, {
    method: 'POST',
    body: JSON.stringify({
      items: input.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      customer: input.customer,
      idempotencyKey: input.idempotencyKey,
    }),
  })

  if (!data?.order) {
    throw new OrderError(DEFAULT_ERROR_MESSAGE, 'SERVER_ERROR')
  }

  return data.order
}

/**
 * Lists the signed-in user's orders. The API scopes these by the auth token;
 * this app's sign-in is local-only and sends none, so it returns no orders.
 */
export async function listOrders(): Promise<Order[]> {
  try {
    const data = await request<{ orders?: Order[] }>(ORDERS_PATH)
    return Array.isArray(data?.orders) ? data.orders : []
  } catch (error) {
    if (error instanceof OrderError && (error.status === 401 || error.status === 403)) {
      return []
    }
    throw error
  }
}

/** Fetches a single order by its public id. Returns null when not found. */
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const data = await request<{ order?: Order }>(
      `${ORDERS_PATH}/${encodeURIComponent(id)}`,
    )
    return data?.order ?? null
  } catch (error) {
    if (
      error instanceof OrderError &&
      (error.status === 401 || error.status === 403 || error.status === 404)
    ) {
      return null
    }
    throw error
  }
}
