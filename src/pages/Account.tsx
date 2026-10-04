import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useNotifications } from '../context/NotificationsContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import './Account.css'

interface Shortcut {
  to: string
  icon: string
  label: string
  description: string
  meta?: string
}

export default function Account() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { favorites } = useFavorites()
  const { unreadCount } = useNotifications()
  const { viewedIds } = useRecentlyViewed()
  const navigate = useNavigate()

  const initial = user?.fullName.trim().charAt(0).toUpperCase() ?? ''

  const stats = [
    { to: '/orders', icon: 'package_2', label: 'Orders', value: '—', meta: 'Coming soon' },
    { to: '/wishlist', icon: 'favorite', label: 'Wishlist', value: String(favorites.length), meta: favorites.length === 1 ? 'item saved' : 'items saved' },
    { to: '/cart', icon: 'shopping_bag', label: 'In Cart', value: String(cartCount), meta: cartCount === 1 ? 'item' : 'items' },
    { to: '/notifications', icon: 'notifications', label: 'Unread', value: String(unreadCount), meta: unreadCount === 1 ? 'update' : 'updates' },
  ]

  const shortcuts: Shortcut[] = [
    { to: '/orders', icon: 'package_2', label: 'Orders', description: 'Track your purchases and delivery status.' },
    { to: '/wishlist', icon: 'favorite', label: 'Wishlist', description: 'Everything you have saved for later.', meta: `${favorites.length} saved` },
    { to: '/redemption', icon: 'redeem', label: 'Redemption Codes', description: 'Redeem codes and claim your rewards.' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications', description: 'Order, payment and promo updates.', meta: unreadCount > 0 ? `${unreadCount} unread` : 'All read' },
    { to: '/cart', icon: 'shopping_bag', label: 'Cart', description: 'Review items before checking out.', meta: `${cartCount} in cart` },
    { to: '/shop', icon: 'local_mall', label: 'Keep Shopping', description: 'Browse the latest drop and restocks.', meta: `${viewedIds.length} recently viewed` },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="account-page">
      <div className="account-hero">
        <div className="account-hero-inner">
          <span className="account-badge">
            <span className="material-symbols-outlined">person</span>
            My Account
          </span>
          <div className="account-identity">
            <span className="account-avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="account-identity-text">
              <h1>{user?.fullName}</h1>
              <p>
                Signed in as {user?.email}
                {user?.phone ? ` · ${user.phone}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="account-content">
        <div className="account-stats">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.to} className="account-stat">
              <span className="account-stat-icon" aria-hidden="true">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </span>
              <span className="account-stat-value">{stat.value}</span>
              <span className="account-stat-label">{stat.label}</span>
              <span className="account-stat-meta">{stat.meta}</span>
            </Link>
          ))}
        </div>

        <section className="account-section">
          <div className="account-section-head">
            <h2>Profile</h2>
            <p>The details tied to your account.</p>
          </div>
          <dl className="account-details">
            <div className="account-detail">
              <dt>Full name</dt>
              <dd>{user?.fullName}</dd>
            </div>
            <div className="account-detail">
              <dt>Email address</dt>
              <dd>{user?.email}</dd>
            </div>
            <div className="account-detail">
              <dt>Phone number</dt>
              <dd>{user?.phone || 'Not provided'}</dd>
            </div>
            <div className="account-detail">
              <dt>Account ID</dt>
              <dd className="account-detail-mono">{user?.id}</dd>
            </div>
          </dl>
        </section>

        <section className="account-section">
          <div className="account-section-head">
            <h2>Quick Actions</h2>
            <p>Jump straight to the things you use most.</p>
          </div>
          <div className="account-shortcuts">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.label}
                to={shortcut.to}
                className="account-shortcut"
              >
                <span className="account-shortcut-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">
                    {shortcut.icon}
                  </span>
                </span>
                <span className="account-shortcut-body">
                  <span className="account-shortcut-label">
                    {shortcut.label}
                  </span>
                  <span className="account-shortcut-desc">
                    {shortcut.description}
                  </span>
                </span>
                {shortcut.meta && (
                  <span className="account-shortcut-meta">{shortcut.meta}</span>
                )}
                <span className="material-symbols-outlined account-shortcut-arrow">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="account-section">
          <div className="account-section-head">
            <h2>Saved Addresses</h2>
            <p>Where your orders should be delivered.</p>
          </div>
          <div className="account-empty">
            <span className="material-symbols-outlined">location_off</span>
            <p>No saved addresses yet.</p>
            <Link to="/shop" className="account-empty-link">
              Start Shopping
            </Link>
          </div>
        </section>

        <section className="account-section">
          <div className="account-section-head">
            <h2>Payment Methods</h2>
            <p>Cards and transfer options on file.</p>
          </div>
          <div className="account-empty">
            <span className="material-symbols-outlined">credit_card_off</span>
            <p>No payment methods saved yet.</p>
            <Link to="/checkout" className="account-empty-link">
              Go to Checkout
            </Link>
          </div>
        </section>

        <section className="account-section">
          <div className="account-section-head">
            <h2>Security</h2>
            <p>Manage your session on this device.</p>
          </div>
          <div className="account-security">
            <div className="account-security-row">
              <span className="account-security-icon" aria-hidden="true">
                <span className="material-symbols-outlined">verified_user</span>
              </span>
              <div className="account-security-body">
                <strong>Active session</strong>
                <span>
                  You are signed in on this device. Log out if you are using a
                  shared computer.
                </span>
              </div>
              <button
                type="button"
                className="account-logout"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined">logout</span>
                Log out
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}