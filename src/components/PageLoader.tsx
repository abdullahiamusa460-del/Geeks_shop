import './PageLoader.css'

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="material-symbols-outlined page-loader-icon">
        progress_activity
      </span>
      <span className="page-loader-text">Loading…</span>
    </div>
  )
}