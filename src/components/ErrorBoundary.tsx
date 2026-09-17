import { Component, type ReactNode } from 'react';

// App-wide error boundary (section 84). Keeps a crash in one screen from
// taking down the whole app, with a friendly recovery path.
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; msg?: string }> {
  state = { hasError: false, msg: undefined as string | undefined };

  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, msg: err instanceof Error ? err.message : 'Unexpected error' };
  }

  componentDidCatch(err: unknown) {
    // In production this could report to a logging endpoint.
    console.error('RAMYA-COOK error:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ paddingTop: 60, maxWidth: 460 }}>
          <div className="card card-pad center" style={{ padding: '40px 24px' }}>
            <div style={{ fontSize: '2.6rem', marginBottom: 8 }} aria-hidden="true">😔</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Something went wrong</h2>
            <p className="muted" style={{ marginBottom: 18 }}>This screen ran into a problem. Your saved recipes and cooking data are safe.</p>
            <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false }); location.assign('/'); }}>Back to safety</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
