import { HelpCircle } from 'lucide-react';

export function HelpButton() {
  return (
    <button
      type="button"
      aria-label="Ajuda"
      className="fixed bottom-20 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-6"
    >
      <HelpCircle size={20} />
    </button>
  );
}
