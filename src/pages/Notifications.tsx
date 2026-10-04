import { useNavigate } from 'react-router-dom'
import {
  useNotifications,
  type AppNotification,
  type NotificationType,
} from '../context/NotificationsContext'
import './Notifications.css'

const TYPE_ICONS: Record<NotificationType, string> = {
  order: 'receipt_long',
  payment: 'payments',
  wishlist: 'favorite',
  promo: 'local_offer',
  new_product: 'new_releases',
  discount: 'percent',
  redemption: 'redeem',
  account: 'notifications',
}

const TYPE_DEFAULT_LINK: Record<NotificationType, string> = {
  order: '/orders',
  payment: '/orders',
  wishlist: '/wishlist',
  promo: '/shop',
  new_product: '/shop',
  discount: '/shop',
  redemption: '/redemption',
  account: '/account',
}

function notificationLink(notification: AppNotification): string {
  if (notification.link) return notification.link
  if (notification.type === 'new_product' && notification.productId) {
    return `/product/${notification.productId}`
  }
  return TYPE_DEFAULT_LINK[notification.type]
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) markAsRead(notification.id)
    navigate(notificationLink(notification))
  }

  return (
    <main className="notifications-page">
      <div className="notifications-hero">
        <div className="notifications-hero-inner">
          <span className="notifications-badge">
            <span className="material-symbols-outlined">notifications</span>
            Notifications
          </span>
          <h1>Your Updates</h1>
          <p>
            Order, payment, wishlist and promo updates — all in one place.
          </p>
        </div>
      </div>

      <div className="notifications-content">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <span className="material-symbols-outlined">
              notifications_none
            </span>
            <h2>You're all caught up</h2>
            <p>
              No notifications yet. Place an order, save a favorite or grab a
              deal and they'll show up here.
            </p>
            <button
              className="notifications-shop-btn"
              onClick={() => navigate('/shop')}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="notifications-toolbar">
              <div className="notifications-count">
                {notifications.length}{' '}
                {notifications.length === 1 ? 'notification' : 'notifications'}
                {unreadCount > 0 && (
                  <span className="notifications-unread-chip">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                className="notifications-mark-all"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <span className="material-symbols-outlined">done_all</span>
                Mark all as read
              </button>
            </div>

            <ul className="notifications-list">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${
                    notification.read ? 'read' : 'unread'
                  }`}
                >
                  <button
                    className="notification-main"
                    onClick={() => openNotification(notification)}
                    aria-label={`Open ${notification.title}`}
                  >
                    <span
                      className="notification-icon"
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined">
                        {TYPE_ICONS[notification.type]}
                      </span>
                    </span>
                    <span className="notification-body">
                      <span className="notification-title-row">
                        <span className="notification-title">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span
                            className="notification-dot"
                            aria-label="Unread"
                          />
                        )}
                      </span>
                      <span className="notification-message">
                        {notification.message}
                      </span>
                      <span className="notification-time">
                        {formatDateTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                  <span className="notification-actions">
                    {!notification.read && (
                      <button
                        className="notification-action"
                        aria-label={`Mark "${notification.title}" as read`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <span className="material-symbols-outlined">
                          mark_email_read
                        </span>
                      </button>
                    )}
                    <button
                      className="notification-action delete"
                      aria-label={`Delete "${notification.title}"`}
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}