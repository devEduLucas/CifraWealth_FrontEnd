import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../Footer/Footer';

interface LayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function Layout({ left, right }: LayoutProps) {
  return (
    <div className="auth-layout relative flex min-h-[calc(100svh-var(--app-banner-height))] w-full flex-col bg-canvas text-foreground">
      <div className="shrink-0 self-start px-2 pt-2 lg:absolute lg:left-2 lg:top-2 lg:z-10 lg:p-0">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs text-subtle transition-colors hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar ao início
        </Link>
      </div>
      <main className="auth-main mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 content-center items-center gap-5 px-4 py-4 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10">
        <div className="min-w-0">{left}</div>
        <div className="flex min-w-0 justify-center">{right}</div>
      </main>
      <Footer />
    </div>
  );
}
