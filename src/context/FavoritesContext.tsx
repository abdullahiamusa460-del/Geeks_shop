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
import { useNotifications } from './NotificationsContext'

const STORAGE_KEY = 'geeks-shop:favorites'

interface FavoritesContextValue {
  favorites: Product[]
  favoriteIds: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
)

function loadFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavoriteIds)
  const { addNotification } = useNotifications()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }, [favoriteIds])

  const favorites = useMemo(
    () => products.filter((p) => favoriteIds.includes(p.id)),
    [favoriteIds],
  )

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  )

  const toggleFavorite = useCallback(
    (product: Product) => {
      const adding = !favoriteIds.includes(product.id)
      setFavoriteIds((prev) =>
        adding
          ? [...prev, product.id]
          : prev.filter((id) => id !== product.id),
      )
      if (adding) {
        addNotification({
          type: 'wishlist',
          title: 'Saved to wishlist',
          message: `${product.name} was added to your wishlist.`,
          link: '/wishlist',
        })
      }
    },
    [favoriteIds, addNotification],
  )

  const removeFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) => prev.filter((id) => id !== productId))
  }, [])

  const clearFavorites = useCallback(() => setFavoriteIds([]), [])

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [
      favorites,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    ],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return ctx
}