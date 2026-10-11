import { useCart } from '../context/CartContext'
import './CartToast.css'

export default function CartToast() {
  const { toast, dismissToast } = useCart()

  if (!toast) return null

  return (
    <div
      key={toast.id}
      className="cart-toast"
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined cart-toast-icon">
        check_circle
      </span>
      <span className="cart-toast-text">{toast.message}</span>
      <button
        type="button"
        className="cart-toast-close"
        aria-label="Dismiss notification"
        onClick={dismissToast}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}
