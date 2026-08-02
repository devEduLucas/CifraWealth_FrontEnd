import type { ReactNode } from 'react';

interface LayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function Layout({ left, right }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-white">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-20">
        <div>{left}</div>
        <div className="flex justify-center">{right}</div>
      </div>
    </div>
  );
}
