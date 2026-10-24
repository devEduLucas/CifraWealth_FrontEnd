import { Eye, EyeOff } from 'lucide-react';
import { useFinancialPrivacy } from '../../hooks/useFinancialPrivacy';

export function FinancialPrivacyButton() {
  const { valuesVisible, toggleValues } = useFinancialPrivacy();
  const label = valuesVisible ? 'Ocultar valores' : 'Mostrar valores';
  return (
    <button
      type="button"
      onClick={toggleValues}
      aria-label={label}
      title={label}
      aria-pressed={!valuesVisible}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-foreground"
    >
      {valuesVisible ? (
        <EyeOff size={18} aria-hidden="true" />
      ) : (
        <Eye size={18} aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
