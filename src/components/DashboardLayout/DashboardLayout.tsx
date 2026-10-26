import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { BottomNav } from '../BottomNav/BottomNav';
import { HelpButton } from '../HelpButton/HelpButton';
import { AppHeader } from '../AppHeader/AppHeader';
import { useSidebar } from '../../hooks/useSidebar';

interface DashboardLayoutProps {
  userName: string;
  children: ReactNode;
}

export function DashboardLayout({ userName, children }: DashboardLayoutProps) {
  const sidebar = useSidebar();
  return (
    <div data-sidebar-collapsed={sidebar.collapsed} className="app-shell min-h-screen bg-canvas text-foreground">
      <Sidebar userName={userName} collapsed={sidebar.collapsed} onToggle={sidebar.toggle} />
      <AppHeader userName={userName} />
      <main id="conteudo-principal" tabIndex={-1} className="app-main min-w-0 px-4 pb-24 pt-[88px] sm:px-6 lg:pb-10 lg:pt-24">
        {children}
      </main>

      <BottomNav />
      <HelpButton />
    </div>
  );
}
