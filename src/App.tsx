import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Placeholder from './pages/Placeholder'
import PageLoader from './components/PageLoader'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider } from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Redemption = lazy(() => import('./pages/Redemption'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Notifications = lazy(() => import('./pages/Notifications'))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/redemption" element={<Redemption />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<Placeholder title="Reset Password" />} />
              <Route path="/new-arrivals" element={<Placeholder title="New Arrivals" />} />
              <Route element={<RequireAuth />}>
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/account" element={<Placeholder title="My Account" />} />
                <Route path="/wishlist" element={<Favorites />} />
                <Route path="/orders" element={<Placeholder title="Orders" />} />
                <Route path="/checkout" element={<Placeholder title="Checkout" />} />
                <Route path="/cart" element={<Placeholder title="Cart" />} />
              </Route>
              <Route path="/help" element={<Placeholder title="Help Center" />} />
              <Route path="/about" element={<Placeholder title="About" />} />
              <Route path="/privacy" element={<Placeholder title="Privacy" />} />
              <Route path="/terms" element={<Placeholder title="Terms" />} />
              <Route path="/cookies" element={<Placeholder title="Cookies" />} />
              <Route path="*" element={<Placeholder title="Page Not Found" />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App