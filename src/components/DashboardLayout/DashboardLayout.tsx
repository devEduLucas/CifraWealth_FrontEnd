import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { BottomNav } from '../BottomNav/BottomNav';
import { HelpButton } from '../HelpButton/HelpButton';
import { AppHeader } from '../AppHeader/AppHeader';

interface DashboardLayoutProps {
  userName: string;
  children: ReactNode;
}

export function DashboardLayout({ userName, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:p-3 focus:text-accent">Ir para o conteúdo</a>
      <Sidebar userName={userName} />
      <AppHeader userName={userName} />
      <main id="conteudo-principal" tabIndex={-1} className="px-4 pb-24 pt-[104px] sm:px-6 lg:ml-[260px] lg:px-10 lg:pb-10 lg:pt-28">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      <BottomNav />
      <HelpButton />
    </div>
  );
}
