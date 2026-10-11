import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatNaira } from '../data/products'
import { amountUntilFreeDelivery, calculateOrderTotals } from '../data/pricing'
import './Cart.css'

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()
  const isEmpty = items.length === 0
  const {
    itemCount,
    subtotal,
    deliveryFee,
    deliveryWaived,
    total,
  } = calculateOrderTotals(items)
  const untilFreeDelivery = amountUntilFreeDelivery(subtotal)

  return (
    <main className="cart-page">
      <div className="cart-hero">
        <div className="cart-hero-inner">
          <span className="cart-badge">
            <span className="material-symbols-outlined">shopping_bag</span>
            Shopping Bag
          </span>
          <h1>Your Cart</h1>
          <p>
            Review your items, update quantities, and proceed when you're ready.
          </p>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-layout">
          <section className="cart-items">
            {isEmpty ? (
              <div className="cart-empty">
                <span className="material-symbols-outlined">
                  remove_shopping_cart
                </span>
                <h2>Your cart is empty</h2>
                <p>
                  Looks like you haven't added anything yet. Explore the latest
                  drops and find something you love.
                </p>
                <Link to="/shop" className="cart-shop-btn">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-toolbar">
                  <span className="cart-count">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <button
                    type="button"
                    className="cart-clear"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>
                </div>

                <ul className="cart-list">
                  {items.map((item) => (
                    <li key={item.product.id} className="cart-row">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="cart-row-img"
                      >
                        <img src={item.product.image} alt={item.product.name} />
                      </Link>

                      <div className="cart-row-info">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="cart-row-name"
                        >
                          {item.product.name}
                        </Link>
                        <span className="cart-row-unit">
                          {formatNaira(item.product.price)} each
                        </span>
                        <div className="cart-row-qty">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <span className="material-symbols-outlined">
                              remove
                            </span>
                          </button>
                          <span
                            className="cart-qty-value"
                            aria-live="polite"
                            aria-label={`Quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            aria-label={`Increase quantity of ${item.product.name}`}
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <span className="material-symbols-outlined">
                              add
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="cart-row-side">
                        <span className="cart-row-total">
                          {formatNaira(item.product.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="cart-row-remove"
                          aria-label={`Remove ${item.product.name} from cart`}
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside className="cart-summary" aria-label="Order summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery fee</span>
              {deliveryWaived ? (
                <span className="cart-summary-free">Free</span>
              ) : (
                <span>{formatNaira(deliveryFee)}</span>
              )}
            </div>
            {!deliveryWaived && untilFreeDelivery > 0 && (
              <p className="cart-summary-hint">
                Add {formatNaira(untilFreeDelivery)} more to unlock free delivery.
              </p>
            )}
            <div className="cart-summary-divider" />
            <div className="cart-summary-total">
              <span>Total</span>
              <strong>{formatNaira(total)}</strong>
            </div>
            <button
              type="button"
              className="cart-checkout-btn"
              disabled={isEmpty}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <Link to="/shop" className="cart-continue-link">
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}
