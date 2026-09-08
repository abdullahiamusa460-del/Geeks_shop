import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Redemption from './pages/Redemption'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/redemption" element={<Redemption />} />
          <Route path="/new-arrivals" element={<Placeholder title="New Arrivals" />} />
          <Route path="/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/account" element={<Placeholder title="My Account" />} />
          <Route path="/wishlist" element={<Placeholder title="Wishlist" />} />
          <Route path="/orders" element={<Placeholder title="Orders" />} />
          <Route path="/checkout" element={<Placeholder title="Checkout" />} />
          <Route path="/cart" element={<Placeholder title="Cart" />} />
          <Route path="/help" element={<Placeholder title="Help Center" />} />
          <Route path="/about" element={<Placeholder title="About" />} />
          <Route path="/privacy" element={<Placeholder title="Privacy" />} />
          <Route path="/terms" element={<Placeholder title="Terms" />} />
          <Route path="/cookies" element={<Placeholder title="Cookies" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
