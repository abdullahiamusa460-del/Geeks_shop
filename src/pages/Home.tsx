import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, categories, heroImage } from '../data/products'
import { useFavorites } from '../context/FavoritesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { getRecommendations } from '../utils/recommendations'
import './Home.css'

const featured = products.filter((p) => p.id === '1' || p.id === '2' || p.id === '3' || p.id === '9' || p.id === '5' || p.id === '6')
const newArrivals = products.slice(0, 4)
const popular = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4)
const redeemable = products.filter((p) => p.redemptionEligible).slice(0, 4)

const valueProps = [
  {
    icon: 'local_shipping',
    title: 'Global Carbon-Neutral Transit',
    desc: 'Complimentary nationwide dispatch on carts over ₦150,000 with automated tracking.',
  },
  {
    icon: 'published_with_changes',
    title: '30-Day Effortless Returns',
    desc: 'Pre-printed return vouchers with instant exchange or complete refund processing.',
  },
  {
    icon: 'shield',
    title: 'Precision Garment Spec',
    desc: 'Zero-pilling finishes, reinforced flatlock seams, and micro-calibrated dimensions.',
  },
  {
    icon: 'redeem',
    title: 'Product Redemption Codes',
    desc: "Have a code? Redeem your product at zero cost. Fast validation & secure redemption.",
  },
]

function SectionHeader({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string
  title: string
  link?: string
}) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="section-link">
          View All
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { favorites } = useFavorites()
  const { viewedIds } = useRecentlyViewed()
  const recommended = getRecommendations({
    favoriteProducts: favorites,
    viewedIds,
    limit: 4,
  })

  return (
    <main className="home">
      {/* Hero / Banner Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">
              <span className="hero-badge-dot" />
              Spring / Summer 2026 Edition
            </span>
            <h1>Engineered for the Modern Creator</h1>
            <p>
              Precision-crafted heavyweight cottons, ergonomic layering, and
              quiet technical fits engineered for extended focus sessions.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-primary">
                Shop Collection
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/redemption" className="btn-secondary">
                <span className="material-symbols-outlined">redeem</span>
                Redeem a Code
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img src={heroImage} alt="Geeks Shop featured product" />
            <span className="hero-stats">
              <strong>4.8</strong> Customer Rating
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home-section">
        <SectionHeader eyebrow="Shop by Category" title="Product Categories" link="/shop" />
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to="/shop" className="category-card" key={cat.name}>
              <div className="category-info">
                <h3>{cat.name}</h3>
                <span>{cat.count} Articles</span>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-section">
        <SectionHeader
          eyebrow="Handpicked for you"
          title="Featured Products"
          link="/shop"
        />
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="offer-banner">
        <div className="offer-content">
          <span className="offer-tag">Special Offer</span>
          <h2>Up to 40% Off Editor's Picks</h2>
          <p>
            Limited-time offers on heavyweight staples. Free shipping on orders
            over ₦150,000.
          </p>
          <Link to="/shop" className="btn-primary-light">
            Shop Deals
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="offer-code">
          <span className="offer-code-label">Use Code</span>
          <span className="offer-code-value">GEEKS40</span>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="home-section">
        <SectionHeader
          eyebrow="Just dropped"
          title="New Arrivals"
          link="/shop"
        />
        <div className="product-grid">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="home-section">
        <SectionHeader
          eyebrow="Most loved"
          title="Popular Right Now"
          link="/shop"
        />
        <div className="product-grid">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Redemption Eligible */}
      <section className="redemption-section">
        <div className="redemption-header">
          <div>
            <span className="section-eyebrow">Have a code?</span>
            <h2 className="section-title">Redemption Eligible Products</h2>
            <p className="redemption-desc">
              These products can be redeemed free of charge using a valid
              redemption code.
            </p>
          </div>
          <Link to="/redemption" className="btn-primary">
            <span className="material-symbols-outlined">redeem</span>
            Redeem Your Code
          </Link>
        </div>
        <div className="product-grid">
          {redeemable.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      <section className="home-section">
        <SectionHeader
          eyebrow="Based on your taste"
          title="Recommended For You"
          link="/shop"
        />
        <div className="product-grid">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="value-section">
        <div className="value-grid">
          {valueProps.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="value-icon">
                <span className="material-symbols-outlined">{v.icon}</span>
              </div>
              <div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
