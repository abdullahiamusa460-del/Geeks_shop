import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <NotificationsProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <App />
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>,
)