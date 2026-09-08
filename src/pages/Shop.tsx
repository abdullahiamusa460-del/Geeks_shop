import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { products, categories } from '../data/products'
import './Shop.css'

const sortOptions = [
  'Featured / Curated',
  'Newest Arrivals',
  'Price: Low to High',
  'Price: High to Low',
  'Highest Rated',
]

const sizes = ['S', 'M', 'L', 'XL', 'XXL']

const palette = ['#36383e', '#c8c9cc', '#e3ded4', '#111111', '#27382b']

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All Apparel')
  const [selectedSize, setSelectedSize] = useState('M')
  const [sort, setSort] = useState(sortOptions[0])
  const [price, setPrice] = useState(90000)
  const [inStock, setInStock] = useState(true)
  const [selectedColor, setSelectedColor] = useState('#111111')
  const [mobileFilters, setMobileFilters] = useState(false)

  let filtered = [...products]
  if (selectedCategory !== 'All Apparel') {
    filtered = filtered.filter((p) => p.category === selectedCategory)
  }
  if (selectedSize) {
    filtered = filtered.filter((p) => p.sizes.includes(selectedSize))
  }
  filtered = filtered.filter((p) => p.price <= price)
  if (inStock) filtered = filtered
  if (selectedColor) {
    filtered = filtered.filter((p) =>
      p.colors.some((c) => c.toLowerCase() === selectedColor.toLowerCase()),
    )
  }

  switch (sort) {
    case 'Price: Low to High':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'Price: High to Low':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'Highest Rated':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  const FilterSidebar = (
    <aside className="filter-sidebar">
      <div className="filter-group">
        <div className="filter-header">
          <h3>Categories</h3>
          <span className="filter-meta">4 groups</span>
        </div>
        <ul className="filter-list">
          <li>
            <button
              className={`filter-item ${selectedCategory === 'All Apparel' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All Apparel')}
            >
              <span>All Apparel</span>
              <span className="filter-count">{products.length}</span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.name}>
              <button
                className={`filter-item ${selectedCategory === c.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.name)}
              >
                <span>{c.name}</span>
                <span className="filter-count">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <div className="filter-header">
          <h3>Sizes</h3>
          <button className="clear-btn" onClick={() => setSelectedSize('')}>
            Clear
          </button>
        </div>
        <div className="size-grid">
          {sizes.map((s) => (
            <button
              key={s}
              className={`size-btn ${selectedSize === s ? 'active' : ''}`}
              onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Palette Swatches</h3>
        <div className="palette-row">
          {palette.map((color) => (
            <button
              key={color}
              aria-label="Select color"
              className={`swatch ${selectedColor === color ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-header">
          <h3>Price Bracket</h3>
          <span className="price-value">₦20k – ₦{Math.round(price / 1000)}k</span>
        </div>
        <input
          type="range"
          min="20000"
          max="150000"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="price-range"
        />
        <div className="price-labels">
          <span>Min ₦20k</span>
          <span>Max ₦150k</span>
        </div>
      </div>

      <div className="filter-group">
        <h3>Availability</h3>
        <label className="check-item">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => setInStock(!inStock)}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      <div className="quality-box">
        <div className="quality-title">
          <span className="material-symbols-outlined">verified</span>
          Quality Guarantee
        </div>
        <p>
          450 GSM French Terry and preshrunk Japanese ring-spun cotton.
          Engineered to resist distortion wash after wash.
        </p>
      </div>
    </aside>
  )

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <div className="breadcrumb">
            Home <span>/</span> Shop <span>/</span>{' '}
            <span className="current">Streetwear &amp; Apparel</span>
          </div>
          <div className="shop-heading">
            <div>
              <span className="shop-badge">
                <span className="hero-badge-dot" />
                Spring / Summer 2026 Edition
              </span>
              <h1>Streetwear &amp; Developer Essentials</h1>
              <p>
                Precision-crafted heavyweight cottons, ergonomic layering, and
                quiet technical fits engineered for extended focus sessions.
              </p>
            </div>
            <div className="shop-count">
              <span className="count-num">{filtered.length}</span>
              <span>Curated Articles</span>
            </div>
          </div>
        </div>
      </section>

      <div className="shop-content">
        <div className="shop-toolbar">
          <div className="toolbar-left">
            <button
              className="filter-toggle"
              onClick={() => setMobileFilters(true)}
            >
              <span className="material-symbols-outlined">tune</span>
              Filters
            </button>
            <div className="active-filter">
              Active filter: {selectedCategory}
            </div>
          </div>
          <div className="sort-control">
            <label htmlFor="sortSelector">Sort By</label>
            <div className="select-wrap">
              <select
                id="sortSelector"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {sortOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>
        </div>

        <div className="shop-layout">
          <div className="sidebar-desktop">{FilterSidebar}</div>

          <main className="catalog-main">
            <div className="catalog-grid">
              {filtered.length > 0 ? (
                filtered.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <div className="no-results">
                  <span className="material-symbols-outlined">search_off</span>
                  <p>No products match your filters.</p>
                </div>
              )}
            </div>

            <div className="pagination">
              <p>
                Showing{' '}
                <span className="bold">
                  1–{Math.min(filtered.length, 9)}
                </span>{' '}
                of <span className="bold">{filtered.length}</span> products
              </p>
              <nav className="pagination-nav">
                <button className="page-btn" disabled>
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {mobileFilters && (
        <div className="mobile-filter-backdrop" onClick={() => setMobileFilters(false)}>
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button
                className="icon-btn"
                onClick={() => setMobileFilters(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mobile-filter-body">{FilterSidebar}</div>
            <button
              className="done-btn"
              onClick={() => setMobileFilters(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
