import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useFavorites } from '../context/FavoritesContext'
import { formatNaira } from '../data/products'
import './Favorites.css'

export default function Favorites() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites()

  const totalValue = favorites.reduce((sum, p) => sum + p.price, 0)

  return (
    <main className="favorites-page">
      <div className="favorites-hero">
        <div className="favorites-hero-inner">
          <span className="favorites-badge">
            <span className="material-symbols-outlined">favorite</span>
            Wishlist
          </span>
          <h1>My Favorites</h1>
          <p>
            Your saved products live here — ready to buy whenever you want.
          </p>
        </div>
      </div>

      <div className="favorites-content">
        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <span className="material-symbols-outlined">
              favorite_border
            </span>
            <h2>No favorites yet</h2>
            <p>
              Tap the heart on any product to save it here and pick up where
              you left off.
            </p>
            <Link to="/shop" className="favorites-shop-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="favorites-toolbar">
              <div className="favorites-count">
                {favorites.length}{' '}
                {favorites.length === 1 ? 'product' : 'products'} saved
              </div>
              <div className="favorites-total">
                Total value:{' '}
                <strong>{formatNaira(totalValue)}</strong>
              </div>
              <button
                className="favorites-clear"
                onClick={clearFavorites}
              >
                Clear all
              </button>
            </div>

            <div className="favorites-grid">
              {favorites.map((p) => (
                <div key={p.id} className="favorites-cell">
                  <ProductCard product={p} />
                  <button
                    className="favorites-remove"
                    onClick={() => removeFavorite(p.id)}
                  >
                    <span className="material-symbols-outlined">
                      favorite
                    </span>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}