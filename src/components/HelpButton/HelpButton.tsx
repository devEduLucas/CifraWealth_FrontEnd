import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export function HelpButton() {
  return (
    <Link
      to="/home"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Sobre a CifraWealth e Ajuda (abre em nova aba)"
      title="Conhecer a CifraWealth / Ajuda (abre em nova aba)"
      className="app-help-button fixed right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-foreground shadow-lg shadow-black/15 transition-transform hover:scale-105 hover:bg-elevated active:scale-95 lg:right-5"
    >
      <HelpCircle size={20} />
    </Link>
  );
}
