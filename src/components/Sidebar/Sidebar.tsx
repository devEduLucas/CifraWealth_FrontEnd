import { LayoutDashboard, List, LogOut, Tag, Target, TrendingUp as ReportsIcon, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { session } from '../../lib/session';
import type { NavItem } from '../../types/dashboard.types';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { key: 'transactions', label: 'Transações', path: '/transactions', icon: 'transactions' },
  { key: 'categories', label: 'Categorias', path: '/categories', icon: 'categories' },
  { key: 'goals', label: 'Metas', path: '/goals', icon: 'goals' },
  { key: 'reports', label: 'Relatórios', path: '/reports', icon: 'reports' },
  { key: 'profile', label: 'Perfil', path: '/profile', icon: 'profile' },
];

const ICONS: Record<NavItem['icon'], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  transactions: List,
  categories: Tag,
  goals: Target,
  reports: ReportsIcon,
  profile: User,
};

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    session.clear();
    navigate('/login', { replace: true });
  }

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="app-sidebar fixed bottom-0 left-0 z-40 hidden w-[260px] flex-col justify-between border-r border-line bg-surface lg:flex">
      <div>
        <div className="flex h-20 items-center border-b border-line px-7">
          <Logo />
        </div>

        <nav aria-label="Menu principal" className="mt-6 flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-accent'
                      : 'text-muted hover:bg-hover hover:text-secondary'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mx-4 flex items-center gap-3 border-t border-line px-2 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-slate-950">
          {initials}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-secondary">{userName}</span>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair"
          title="Sair"
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-hover hover:text-danger"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
