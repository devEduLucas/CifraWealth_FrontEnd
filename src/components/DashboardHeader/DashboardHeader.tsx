import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  firstName: string;
  initials: string;
}

export function DashboardHeader({ firstName, initials }: DashboardHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {firstName}</h1>
        <p className="mt-0.5 text-sm text-slate-400">Bem-vindo de volta.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#202634] bg-[#121827] text-slate-300 transition-colors hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">
          {initials}
        </span>
      </div>
    </header>
  );
}
