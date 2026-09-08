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
      </div>
    </main>
  )
}
