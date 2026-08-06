import { LayoutDashboard, List, Tag, Target, TrendingUp as ReportsIcon, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
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
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col justify-between border-r border-[#1B2231] bg-[#0B1020] px-5 py-6 lg:flex">
      <div>
        <div className="px-2">
          <Logo />
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
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

      <div className="flex items-center gap-3 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-slate-950">
          {initials}
        </span>
        <span className="text-sm font-medium text-slate-200">{userName}</span>
      </div>
    </aside>
  );
}
