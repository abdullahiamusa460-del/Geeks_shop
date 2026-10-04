import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useCart } from '../context/CartContext'
import './Layout.css'

export default function Layout() {
  const { cartCount } = useCart()

  return (
    <div className="layout">
      <Header cartCount={cartCount} />
      <div className="layout-body">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}