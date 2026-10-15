import { isDemoMode } from '../../lib/config';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div className="demo-banner"><div role="status" className="demo-banner fixed inset-x-0 top-0 z-[60] flex items-center justify-center border-b border-amber-400/30 bg-amber-950 px-4 text-center text-xs text-amber-100">
      Modo demonstração — dados fictícios salvos apenas neste navegador. Login e e-mail são simulados.
    </div></div>
  );
}
