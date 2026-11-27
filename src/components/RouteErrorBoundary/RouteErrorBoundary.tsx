import { Component, type ReactNode } from 'react';

export class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main id="conteudo-principal" tabIndex={-1} className="min-h-screen bg-canvas px-6 py-24 text-foreground">
      <h1 className="text-2xl font-bold">Não foi possível abrir esta página</h1>
      <p role="alert" className="mt-3 text-secondary">Confira sua conexão e recarregue para tentar novamente.</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 rounded-xl bg-accent px-5 font-semibold text-on-accent">Recarregar página</button>
    </main>;
  }
}
