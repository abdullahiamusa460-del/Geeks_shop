import { Component, type ErrorInfo, type ReactNode } from 'react'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-page">
          <div className="error-card" role="alert">
            <span className="material-symbols-outlined error-icon">
              error
            </span>
            <h2>Something went wrong</h2>
            <p>
              An unexpected error occurred while rendering this page. Please
              try again.
            </p>
            <button className="error-retry" onClick={this.handleReload}>
              Try Again
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}