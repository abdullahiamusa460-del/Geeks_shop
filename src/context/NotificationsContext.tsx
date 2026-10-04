import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products } from '../data/products'

export type NotificationType =
  | 'order'
  | 'payment'
  | 'wishlist'
  | 'promo'
  | 'new_product'
  | 'discount'
  | 'redemption'
  | 'account'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string
  productId?: string
}

type NewNotification = Omit<AppNotification, 'id' | 'createdAt' | 'read'>

// Currently there is no backend/auth, so notifications are stored per device.
// The storage key is already scoped per user so it can be parameterized with
// a real userId the moment authentication is connected. TODO: migrate to the
// documented /api/* backend from system documentation.md.
const STORAGE_KEY = 'geeks-shop:notifications'
const USER_SCOPE_KEY = 'geeks-shop:notifications:user'
const SEEDED_FLAG_KEY = 'geeks-shop:notifications:seeded'
const MAX_NOTIFICATIONS = 50

const VALID_TYPES = new Set<NotificationType>([
  'order',
  'payment',
  'wishlist',
  'promo',
  'new_product',
  'discount',
  'redemption',
  'account',
])

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (notification: NewNotification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined)

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function firstProductId(namePart: string): string | undefined {
  const product = products.find((p) => p.name.toLowerCase().includes(namePart))
  return product?.id
}

function firstProductName(namePart: string): string | undefined {
  const product = products.find((p) => p.name.toLowerCase().includes(namePart))
  return product?.name
}

function buildSeedNotifications(): AppNotification[] {
  const jacketId = firstProductId('utility jacket')
  const jacketName = firstProductName('utility jacket')
  return [
    {
      id: makeId(),
      type: 'order',
      title: 'Order confirmed',
      message: 'Your order #GK-10421 was confirmed. We are preparing your items.',
      createdAt: minutesAgo(45),
      read: false,
      link: '/orders',
    },
    {
      id: makeId(),
      type: 'payment',
      title: 'Payment successful',
      message: 'Your payment of $129.99 for order #GK-10421 was successful.',
      createdAt: minutesAgo(38),
      read: false,
      link: '/orders',
    },
    {
      id: makeId(),
      type: 'order',
      title: 'Order shipped',
      message: 'Order #GK-10421 is on its way. Track your package from Orders.',
      createdAt: minutesAgo(21),
      read: false,
      link: '/orders',
    },
    {
      id: makeId(),
      type: 'promo',
      title: 'Weekend offer: 25% off',
      message: 'Use code WEEKEND25 on your next order. Valid for all gear and accessories.',
      createdAt: minutesAgo(60 * 5),
      read: false,
      link: '/shop',
    },
    {
      id: makeId(),
      type: 'new_product',
      title: 'New arrival in stock',
      message: `${jacketName ?? 'A limited edition jacket'} just landed. Be among the first to get it.`,
      createdAt: minutesAgo(60 * 26),
      read: false,
      link: jacketId ? `/product/${jacketId}` : '/shop',
      productId: jacketId,
    },
    {
      id: makeId(),
      type: 'discount',
      title: 'Free shipping today',
      message: 'All orders over $40 ship free until midnight. No code needed.',
      createdAt: minutesAgo(60 * 30),
      read: true,
      link: '/shop',
    },
    {
      id: makeId(),
      type: 'redemption',
      title: 'Redemption ready',
      message: 'Your reward points can now be redeemed for exclusive products.',
      createdAt: minutesAgo(60 * 50),
      read: true,
      link: '/redemption',
    },
    {
      id: makeId(),
      type: 'account',
      title: 'Welcome to Geeks',
      message: 'Your account is ready. Complete your profile to unlock personalized offers.',
      createdAt: minutesAgo(60 * 72),
      read: true,
      link: '/account',
    },
  ]
}

function parseNotifications(raw: string | null): AppNotification[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (n): n is AppNotification =>
          n &&
          typeof n === 'object' &&
          typeof n.id === 'string' &&
          typeof n.type === 'string' &&
          VALID_TYPES.has(n.type as NotificationType) &&
          typeof n.title === 'string' &&
          typeof n.message === 'string' &&
          typeof n.createdAt === 'string' &&
          typeof n.read === 'boolean',
      )
      .slice(0, MAX_NOTIFICATIONS)
  } catch {
    return []
  }
}

function getStorageKey(): string {
  try {
    const user = localStorage.getItem(USER_SCOPE_KEY)
    if (user) return `${STORAGE_KEY}:${user}`
  } catch {
    // storage unavailable; use default key
  }
  return STORAGE_KEY
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      let restored = parseNotifications(localStorage.getItem(getStorageKey()))
      const seeded = localStorage.getItem(SEEDED_FLAG_KEY)
      if (restored.length === 0 && !seeded) {
        restored = buildSeedNotifications()
        localStorage.setItem(SEEDED_FLAG_KEY, '1')
      }
      return restored
    } catch {
      return buildSeedNotifications()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(notifications))
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }, [notifications])

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === getStorageKey() && event.newValue !== null) {
        setNotifications(parseNotifications(event.newValue))
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addNotification = useCallback((notification: NewNotification) => {
    setNotifications((prev) => {
      const next: AppNotification = {
        ...notification,
        id: makeId(),
        createdAt: new Date().toISOString(),
        read: false,
      }
      return [next, ...prev].slice(0, MAX_NOTIFICATIONS)
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    ],
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return ctx
}