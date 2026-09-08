import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

interface HeaderProps {
  cartCount: number
}

const navLinks = ['Home', 'Shop', 'New Arrivals', 'Redemption', 'My Account']

export default function Header({ cartCount }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="header-left">
            <button
              className="icon-btn menu-btn"
              aria-label="Open menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/" className="logo">
              GEEKS<span className="logo-light">SHOP</span>
              <span className="logo-dot" />
            </Link>
          </div>

          <nav className="main-nav">
            {navLinks.map((link, i) => (
              <Link
                key={link}
                to={i === 0 ? '/' : `/${link.toLowerCase().replace(/\s+/g, '-')}`}
                className={`nav-link ${i === 0 ? 'active' : ''}`}
              >
                {link}
              </Link>
            ))}
          </nav>

          <div className="header-right">
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <Link to="/notifications" className="icon-btn" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="badge-dot">3</span>
            </Link>
            <Link to="/account" className="icon-btn" aria-label="Profile">
              <span className="material-symbols-outlined">person</span>
            </Link>
            <button
              className="icon-btn cart-btn"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && <span className="badge-dot">{cartCount}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              autoFocus
            />
            <span className="material-symbols-outlined">search</span>
          </div>
        )}

        {menuOpen && (
          <nav className="mobile-nav">
            {navLinks.map((link, i) => (
              <Link
                key={link}
                to={i === 0 ? '/' : `/${link.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="drawer-title">
                <span className="material-symbols-outlined">shopping_bag</span>
                <h2>Your Cart</h2>
                <span className="drawer-count">{cartCount} items</span>
              </div>
              <button
                className="icon-btn"
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="drawer-empty">
              <span className="material-symbols-outlined">shopping_bag</span>
              <p>Your cart is empty</p>
              <Link to="/shop" onClick={() => setCartOpen(false)}>
                Start Shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
