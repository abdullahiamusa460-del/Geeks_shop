import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProductById, type Product } from '../data/products'

const STORAGE_KEY = 'geeks-shop:cart'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartToast {
  id: number
  message: string
}

interface CartContextValue {
  items: CartItem[]
  cartCount: number
  cartTotal: number
  toast: CartToast | null
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function sanitizeQuantity(quantity: unknown): number {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.floor(value))
}

/** What we actually persist — identifiers only, never a price. */
interface StoredCartItem {
  productId: string
  quantity: number
}

/**
 * Persist only `{ productId, quantity }`. Product details (including price)
 * are always re-resolved from the trusted catalog on load, so a tampered or
 * stale stored price can never affect the cart or the order total.
 */
function serializeCartItems(items: CartItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
  )
}

function parseCartItems(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((entry) => {
      if (
        !entry ||
        typeof entry !== 'object' ||
        typeof entry.productId !== 'string' ||
        !getProductById(entry.productId)
      ) {
        return []
      }
      const stored = entry as StoredCartItem
      return [
        {
          product: getProductById(stored.productId)!,
          quantity: sanitizeQuantity(stored.quantity),
        },
      ]
    })
  } catch {
    return []
  }
}

function loadCartItems(): CartItem[] {
  try {
    return parseCartItems(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartItems)
  const [toast, setToast] = useState<CartToast | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeCartItems(items))
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }, [items])

  // Auto-dismiss the success message a few seconds after it appears.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  // Keep the cart consistent across tabs/windows, mirroring the notifications
  // store. Products are re-resolved from the catalog on the way in.
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setItems(parseCartItems(event.newValue))
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const qty = sanitizeQuantity(quantity)
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i,
        )
      }
      return [...prev, { product, quantity: qty }]
    })
    // Re-key the toast so adding again replays the message/animation.
    setToast((prev) => ({
      id: (prev?.id ?? 0) + 1,
      message:
        qty > 1
          ? `${qty} × ${product.name} added to your cart`
          : `${product.name} added to your cart`,
    }))
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: sanitizeQuantity(quantity) }
          : i,
      ),
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      cartCount,
      cartTotal,
      toast,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      dismissToast,
    }),
    [
      items,
      cartCount,
      cartTotal,
      toast,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      dismissToast,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
