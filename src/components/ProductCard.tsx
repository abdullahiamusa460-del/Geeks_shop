import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatNaira, type Product } from '../data/products'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState<string | null>(null)
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(product.id)

  const handleQuickAdd = () => {
    addToCart(product, 1)
    setAdded('added')
    setTimeout(() => setAdded('incart'), 600)
    setTimeout(() => setAdded(null), 2000)
  }

  return (
    <article className="product-card">
      <div className="product-media">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        {product.redemptionEligible && (
          <span className="product-redeem">
            <span className="material-symbols-outlined">redeem</span>
            Redeemable
          </span>
        )}
        <button
          className={`wishlist-btn ${liked ? 'liked' : ''}`}
          aria-label={`${liked ? 'Remove' : 'Add'} ${product.name} ${liked ? 'from' : 'to'} wishlist`}
          onClick={() => toggleFavorite(product)}
        >
          <span className="material-symbols-outlined">
            {liked ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="quick-add">
          <button onClick={handleQuickAdd}>
            <span className="material-symbols-outlined">
              {added === 'added'
                ? 'progress_activity'
                : added === 'incart'
                  ? 'check'
                  : 'shopping_bag'}
            </span>
            {added === 'added'
              ? 'Adding...'
              : added === 'incart'
                ? 'In Cart'
                : `Quick Add · ${formatNaira(product.price)}`}
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-rating">
          <span className="material-symbols-outlined">star</span>
          <span className="rating-value">{product.rating}</span>
          <span className="rating-count">({product.reviews} reviews)</span>
        </div>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <p className="product-desc">{product.description}</p>
        <div className="product-bottom">
          <div className="product-price">
            <span className="price-now">{formatNaira(product.price)}</span>
            {product.discountPrice && (
              <span className="price-was">
                {formatNaira(product.discountPrice)}
              </span>
            )}
          </div>
          {product.colors.length > 0 && (
            <div className="color-dots">
              {product.colors.map((c) => (
                <span
                  key={c}
                  className="color-dot"
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
