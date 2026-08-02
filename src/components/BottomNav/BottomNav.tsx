import { LayoutDashboard, List, Target, TrendingUp as ReportsIcon, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../types/dashboard.types';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { key: 'transactions', label: 'Transações', path: '/transactions', icon: 'transactions' },
  { key: 'goals', label: 'Metas', path: '/goals', icon: 'goals' },
  { key: 'reports', label: 'Relatórios', path: '/reports', icon: 'reports' },
  { key: 'profile', label: 'Perfil', path: '/profile', icon: 'profile' },
];

const ICONS: Record<NavItem['icon'], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  transactions: List,
  goals: Target,
  reports: ReportsIcon,
  profile: User,
};

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-between border-t border-[#1B2231] bg-[#0B1020] px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`
            }
          >
            <Icon size={20} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
