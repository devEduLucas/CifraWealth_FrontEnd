import { LogOut, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function handleLogout() {
    session.clear();
    navigate('/login', { replace: true });
  }

  return (
    <DashboardLayout userName={fullName}>
      <h1 className="text-2xl font-bold text-white">Perfil</h1>
      <p className="mt-1 text-sm text-slate-400">Suas informações de conta.</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#202634] bg-[#121827] p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xl font-bold text-slate-950">
          {initials}
        </span>
        <div>
          <p className="text-lg font-semibold text-white">{fullName}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#202634] bg-[#121827] p-6">
        <div className="flex items-center gap-3 border-b border-[#202634] pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
            <User size={16} />
          </span>
          <div>
            <p className="text-xs text-slate-500">Nome completo</p>
            <p className="text-sm font-medium text-white">{fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
            <Mail size={16} />
          </span>
          <div>
            <p className="text-xs text-slate-500">E-mail</p>
            <p className="text-sm font-medium text-white">{user?.email}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </DashboardLayout>
  );
}
