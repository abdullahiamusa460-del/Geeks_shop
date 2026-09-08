import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const shopLinks = [
  'Heavyweight Hoodies',
  'Developer Graphic Tees',
  'Utility Pants & Techwear',
  'Desk & Studio Gear',
]

const helpLinks = [
  'Help Center',
  'Track Your Order',
  'Shipping & Delivery',
  'Returns & Exchanges',
  'Size Guide',
]

const aboutLinks = ['About Geeks Shop', 'Sustainability', 'Careers', 'Press']

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              GEEKS<span className="logo-light">SHOP</span>
            </div>
            <p>
              Elevated contemporary apparel crafted for modern living. Quiet
              structure, technical fabrications, and understated aesthetics.
            </p>
            <div className="subscribe">
              <span className="subscribe-label">
                Subscribe to the Dispatch
              </span>
              <form
                className="subscribe-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email) setSubscribed(true)
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">
                  {subscribed ? 'Joined' : 'Join'}
                </button>
              </form>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              {shopLinks.map((l) => (
                <li key={l}>
                  <Link to="/shop">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              {helpLinks.map((l) => (
                <li key={l}>
                  <Link to="/help">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {aboutLinks.map((l) => (
                <li key={l}>
                  <Link to="/about">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Geeks Shop. All rights reserved.</span>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
