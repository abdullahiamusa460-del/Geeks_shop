import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, formatNaira } from '../data/products'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? '')
  const [selectedSize, setSelectedSize] = useState('M')
  const [activeTab, setActiveTab] = useState('Details')
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <main className="not-found">
        <h1>Product not found</h1>
        <Link to="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </main>
    )
  }

  const related = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.discountPrice - product.price) / product.discountPrice) * 100,
      )
    : 0

  const tabs = ['Details', 'Materials', 'Size & Fit', 'Shipping & Returns']

  return (
    <main className="pdp">
      <div className="pdp-container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to="/shop">Hoodies</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="pdp-gallery">
            <div className="pdp-thumbs">
              <button className="thumb active" type="button">
                <img src={product.image} alt={product.name} />
              </button>
              <button className="thumb" type="button">
                <img src={product.image} alt={product.name} />
              </button>
              <button className="thumb" type="button">
                <img src={product.image} alt={product.name} />
              </button>
              <button className="thumb" type="button">
                <img src={product.image} alt={product.name} />
              </button>
            </div>
            <div className="pdp-stage">
              <img src={product.image} alt={product.name} />
              <button className="zoom-btn" aria-label="Zoom image">
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
          </div>

          <div className="pdp-info">
            <span className="pdp-badge">
              {product.badge ?? 'New Arrival'}
            </span>
            <h1>{product.name}</h1>
            <div className="pdp-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="material-symbols-outlined"
                  >
                    star
                  </span>
                ))}
              </div>
              <span>{product.rating}</span>
              <span className="review-count">({product.reviews} reviews)</span>
            </div>

            <div className="pdp-price">
              <span className="price-now">{formatNaira(product.price)}</span>
              {product.discountPrice && (
                <>
                  <span className="price-was">
                    {formatNaira(product.discountPrice)}
                  </span>
                  <span className="discount-tag">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="pdp-desc">
              Premium heavyweight combed cotton with an architected oversized
              fit for ultimate comfort and modern tech streetwear styling.
            </p>

            <div className="divider" />

            <div className="select-block">
              <div className="select-label">
                Color: <span className="muted">{selectedColor}</span>
              </div>
              <div className="swatch-row">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    aria-label="Select color"
                    className={`swatch-btn ${selectedColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="select-block">
              <div className="select-label">
                Size: <span className="muted">{selectedSize}</span>
                <button className="size-guide">
                  <span className="material-symbols-outlined">straighten</span>
                  Size Guide
                </button>
              </div>
              <div className="size-row">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-select ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="cta-row">
              <button
                className={`add-btn ${added ? 'added' : ''}`}
                onClick={() => {
                  setAdded(true)
                  setTimeout(() => setAdded(false), 2000)
                }}
              >
                <span className="material-symbols-outlined">
                  {added ? 'check' : 'shopping_bag'}
                </span>
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                className={`wish-btn ${liked ? 'liked' : ''}`}
                aria-label="Save to Wishlist"
                onClick={() => setLiked(!liked)}
              >
                <span className="material-symbols-outlined">
                  {liked ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>

            <div className="trust-cluster">
              <div className="trust-item">
                <span className="material-symbols-outlined">
                  local_shipping
                </span>
                <div>
                  <span className="trust-title">Free Shipping</span>
                  <span className="trust-desc">On orders over ₦150k</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="material-symbols-outlined">
                  published_with_changes
                </span>
                <div>
                  <span className="trust-title">Easy Returns</span>
                  <span className="trust-desc">30-day return policy</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="material-symbols-outlined">
                  verified_user
                </span>
                <div>
                  <span className="trust-title">Secure Payment</span>
                  <span className="trust-desc">100% secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdp-mid">
          <div className="tab-bar">
            {tabs.map((t) => (
              <button
                key={t}
                className={`tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="tab-copy">
              <h2>Crafted for everyday utility and refined drape.</h2>
              <p>
                Crafted from high-density cotton fleece, this piece delivers
                unmatched comfort, longevity, and silhouette integrity. The
                dropped shoulder and tailored volume make it an essential
                centerpiece for high-low rotation.
              </p>
              <div className="feature-list">
                <div className="feature">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">checkroom</span>
                  </div>
                  <span>Architectural oversized boxy silhouette</span>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">layers</span>
                  </div>
                  <span>Ultra-soft organic French terry cotton</span>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <span>Heavyweight ribbed cuffs that retain memory</span>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <span>Gender-neutral sizing and proportional balance</span>
                </div>
              </div>
            </div>
            <div className="tab-image">
              <img src={product.image} alt={product.name} />
              <div className="tab-overlay">
                <span className="overlay-label">Textile Micro-Structure</span>
                <p>ESSENTIALS COLLECTION • 100% COMBED ORGANIC COTTON</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pdp-related">
          <div className="section-header">
            <h2 className="section-title">You May Also Like</h2>
            <Link to="/shop" className="section-link">
              View All
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
