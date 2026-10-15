import { isDemoMode } from '../../lib/config';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div role="status" className="border-b border-amber-400/30 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-200">
      Modo demonstração — dados fictícios salvos apenas neste navegador. Login e e-mail são simulados.
    </div>
  );
}
