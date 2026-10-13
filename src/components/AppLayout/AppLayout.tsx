import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, LogOut, Tag, Target, TrendingUp } from 'lucide-react';
import { Logo } from '../Logo/Logo';
import { session } from '../../lib/session';
import { Footer } from '../Footer/Footer';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: List },
  { to: '/categories', label: 'Categorias', icon: Tag },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/reports', label: 'Relatórios', icon: TrendingUp },
];

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

function navClass(isActive: boolean): string {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-[#121827] hover:text-white'
  }`;
}

export function AppLayout({ title, subtitle, action, children }: AppLayoutProps) {
  const navigate = useNavigate();
  const user = session.getUser();
  const fullName = [user?.nome, user?.sobrenome].filter(Boolean).join(' ') || 'Usuário';
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  function handleLogout() {
    session.clear();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1020] text-white md:flex-row">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#202634] p-5 md:sticky md:top-0 md:flex md:h-screen">
        <div className="mb-8 px-1">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navClass(isActive)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-t border-[#202634] pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-slate-950">
            {initials}
          </span>
          <span className="flex-1 truncate text-sm font-medium">{fullName}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="text-slate-400 transition-colors hover:text-red-400"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-[#202634] px-4 py-3 md:hidden">
        <Logo />
        <button type="button" onClick={handleLogout} aria-label="Sair" className="text-slate-400">
          <LogOut size={18} />
        </button>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-[#202634] px-3 py-2 md:hidden">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${navClass(isActive)} shrink-0`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex flex-1 flex-col px-6 py-8 md:px-10">
        <div className="mx-auto w-full max-w-4xl flex-1">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
