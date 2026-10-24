import { LayoutDashboard, List, LogOut, PanelLeftClose, PanelLeftOpen, Tag, Target, TrendingUp as ReportsIcon, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { session } from '../../lib/session';
import type { NavItem } from '../../types/dashboard.types';
import { UserAvatar } from '../UserAvatar/UserAvatar';
import { useSessionUser } from '../../hooks/useSessionUser';

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
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ userName, collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const user = useSessionUser();

  function handleLogout() {
    session.clear();
    navigate('/login', { replace: true });
  }

  return (
    <aside aria-label="Menu lateral" className="app-sidebar fixed bottom-0 left-0 z-40 hidden flex-col justify-between overflow-x-hidden border-r border-line bg-surface lg:flex">
      <div className="min-h-0 overflow-y-auto">
        <div className={'flex h-20 shrink-0 items-center border-b border-line ' + (collapsed ? 'justify-center' : 'justify-between gap-2 px-4')}>
          {!collapsed && <Link to="/dashboard" aria-label="CifraWealth — Dashboard"><Logo /></Link>}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar-nav"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
          </button>
        </div>

        <nav id="app-sidebar-nav" aria-label="Menu principal" className={'mt-6 flex flex-col gap-1 ' + (collapsed ? 'px-3' : 'px-4')}>
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <NavLink
                key={item.key}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${
                    isActive
                      ? 'bg-accent/10 text-accent-ink'
                      : 'text-muted hover:bg-hover hover:text-secondary'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />
                <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={'flex shrink-0 items-center gap-3 border-t border-line py-5 ' + (collapsed ? 'mx-3 flex-col' : 'mx-4 px-2')}>
        <Link to="/profile" aria-label={'Abrir perfil de ' + userName} title="Meu perfil" className={'flex min-w-0 items-center gap-3 rounded-xl ' + (collapsed ? '' : 'flex-1')}>
          <UserAvatar name={userName} photo={user?.foto_perfil} className="h-9 w-9 text-xs" />
          <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate text-sm font-medium text-secondary'}>{userName}</span>
        </Link>
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
