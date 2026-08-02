import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { BottomNav } from '../BottomNav/BottomNav';
import { HelpButton } from '../HelpButton/HelpButton';

interface DashboardLayoutProps {
  userName: string;
  children: ReactNode;
}

export function DashboardLayout({ userName, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <Sidebar userName={userName} />

      <main className="px-4 pb-24 pt-6 sm:px-6 lg:ml-[260px] lg:px-10 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      <BottomNav />
      <HelpButton />
    </div>
  );
}
