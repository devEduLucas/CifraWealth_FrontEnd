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
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:p-3 focus:text-accent-ink">Ir para o conteúdo</a>
      <Sidebar userName={userName} collapsed={sidebar.collapsed} onToggle={sidebar.toggle} />
      <AppHeader userName={userName} />
      <main id="conteudo-principal" tabIndex={-1} className="app-main min-w-0 px-4 pb-24 pt-[104px] sm:px-6 lg:pb-10 lg:pt-28">
        {children}
      </main>

      <BottomNav />
      <HelpButton />
    </div>
  );
}
