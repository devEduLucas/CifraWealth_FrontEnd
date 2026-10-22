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
      className="fixed bottom-20 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-24"
    >
      <HelpCircle size={20} />
    </Link>
  );
}
