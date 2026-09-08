import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

export default function Layout() {
  const [cartCount] = useState(0)

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
