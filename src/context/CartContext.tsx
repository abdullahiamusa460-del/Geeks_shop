import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from '../data/products'

const STORAGE_KEY = 'geeks-shop:cart'

const productById = new Map(products.map((p) => [p.id, p]))

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function sanitizeQuantity(quantity: unknown): number {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.floor(value))
}

function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (entry): entry is { productId: string; quantity: number } =>
          entry &&
          typeof entry === 'object' &&
          typeof entry.productId === 'string' &&
          productById.has(entry.productId),
      )
      .map((entry) => ({
        product: productById.get(entry.productId)!,
        quantity: sanitizeQuantity(entry.quantity),
      }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartItems)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }, [items])

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
  }, [])

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
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart],
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