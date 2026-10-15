import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export function HelpButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/home')}
      aria-label="Sobre a CifraWealth e Ajuda"
      title="Conhecer a CifraWealth / Ajuda"
      className="fixed bottom-20 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-6"
    >
      <HelpCircle size={20} />
    </button>
  );
}