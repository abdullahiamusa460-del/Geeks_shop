import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import './Header.css'

interface HeaderProps {
  cartCount: number
}

const navLinks = ['Home', 'Shop', 'New Arrivals', 'Redemption', 'My Account']

const navPaths: Record<string, string> = {
  Home: '/',
  Shop: '/shop',
  'New Arrivals': '/new-arrivals',
  Redemption: '/redemption',
  'My Account': '/account',
}

export default function Header({ cartCount }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const initial = user ? user.fullName.trim().charAt(0).toUpperCase() : ''

  const handleLogout = () => {
    setAccountOpen(false)
    setMenuOpen(false)
    logout()
  }

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
                to={navPaths[link]}
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
            {isAuthenticated ? (
              <div className="account-wrap">
                <button
                  className="icon-btn account-btn"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  <span className="account-initial">{initial}</span>
                </button>
                {accountOpen && (
                  <div className="account-menu">
                    <div className="account-meta">
                      <strong>{user?.fullName}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                    >
                      <span className="material-symbols-outlined">person</span>
                      My Account
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)}>
                      <span className="material-symbols-outlined">
                        package_2
                      </span>
                      Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setAccountOpen(false)}>
                      <span className="material-symbols-outlined">favorite</span>
                      Wishlist
                    </Link>
                    <button type="button" onClick={handleLogout}>
                      <span className="material-symbols-outlined">logout</span>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Sign in">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
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
            {navLinks.map((link) => (
              <Link
                key={link}
                to={navPaths[link]}
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
