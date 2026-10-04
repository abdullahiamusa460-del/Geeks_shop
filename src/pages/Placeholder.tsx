import { Link } from 'react-router-dom'
import './Placeholder.css'

interface PlaceholderProps {
  title: string
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className="placeholder-page">
      <div className="placeholder-content">
        <span className="material-symbols-outlined">construction</span>
        <h1>{title}</h1>
        <p>This page is coming soon. We're working on it.</p>
        <Link to="/shop" className="placeholder-link">
          Browse Products
        </Link>
      </div>
    </main>
  )
}