import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'geeks-shop:recently-viewed'
const MAX_VIEWED = 20

interface RecentlyViewedContextValue {
  viewedIds: string[]
  recordView: (productId: string) => void
  clearViewed: () => void
}

const RecentlyViewedContext = createContext<
  RecentlyViewedContextValue | undefined
>(undefined)

function loadViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string').slice(0, MAX_VIEWED)
      : []
  } catch {
    return []
  }
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [viewedIds, setViewedIds] = useState<string[]>(loadViewedIds)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedIds))
    } catch {
      // storage unavailable; keep in-memory state only
    }
  }, [viewedIds])

  const recordView = useCallback((productId: string) => {
    setViewedIds((prev) =>
      [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_VIEWED),
    )
  }, [])

  const clearViewed = useCallback(() => setViewedIds([]), [])

  const value = useMemo(
    () => ({ viewedIds, recordView, clearViewed }),
    [viewedIds, recordView, clearViewed],
  )

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext)
  if (!ctx) {
    throw new Error(
      'useRecentlyViewed must be used within a RecentlyViewedProvider',
    )
  }
  return ctx
}