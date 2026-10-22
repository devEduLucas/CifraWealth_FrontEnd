import { LogOut, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../lib/theme';

export function ProfilePage() {
  const navigate = useNavigate();
  const { preference, setPreference } = useTheme();
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
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-on-accent">
          {initials}
        </span>
        <div className="min-w-0 break-words">
          <p className="text-lg font-semibold text-foreground">{fullName}</p>
          <p className="text-sm text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-ink">
            <User size={16} />
          </span>
          <div className="min-w-0 break-words">
            <p className="text-xs text-subtle">Nome completo</p>
            <p className="text-sm font-medium text-foreground">{fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-ink">
            <Mail size={16} />
          </span>
          <div className="min-w-0 break-words">
            <p className="text-xs text-subtle">E-mail</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <label htmlFor="theme-preference" className="text-sm font-semibold text-foreground">Aparência</label>
        <p id="theme-preference-hint" className="mt-1 text-sm text-muted">Acompanhe o tema do dispositivo ou escolha uma aparência para este navegador.</p>
        <select id="theme-preference" aria-describedby="theme-preference-hint" value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)} className="mt-4 h-11 w-full max-w-sm rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground">
          <option value="system">Usar tema do dispositivo</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </DashboardLayout>
  );
}
