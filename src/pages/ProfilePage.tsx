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
      <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
      <p className="mt-1 text-sm text-muted">Suas informações de conta.</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xl font-bold text-slate-950">
          {initials}
        </span>
        <div className="min-w-0 break-words">
          <p className="text-lg font-semibold text-foreground">{fullName}</p>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-accent">
            <User size={16} />
          </span>
          <div className="min-w-0 break-words">
            <p className="text-xs text-subtle">Nome completo</p>
            <p className="text-sm font-medium text-foreground">{fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-accent">
            <Mail size={16} />
          </span>
          <div className="min-w-0 break-words">
            <p className="text-xs text-subtle">E-mail</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-danger transition-colors hover:bg-red-500/20"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </DashboardLayout>
  );
}
