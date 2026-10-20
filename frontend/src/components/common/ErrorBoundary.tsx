import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { hasError: boolean }

/** Last line of defence: a render crash shows a recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="card card-pad max-w-md text-center">
          <h1 className="text-xl font-bold text-fg">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">The page hit an unexpected problem. Your data is safe. Reload to continue.</p>
          <button className="btn btn-primary mt-6" onClick={() => window.location.reload()}>Reload page</button>
        </div>
      </div>
    )
  }
}
