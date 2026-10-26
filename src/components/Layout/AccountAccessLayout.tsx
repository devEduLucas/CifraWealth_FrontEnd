import type { ReactNode } from 'react';
import { KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import { Layout } from './Layout';
import { Logo } from '../Logo/Logo';

interface AccountAccessLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Keep account access tasks visible immediately on small screens. */
export function AccountAccessLayout({ title, description, children }: AccountAccessLayoutProps) {
  return (
    <Layout
      left={
        <div className="flex flex-col items-center gap-8 lg:items-start">
          <Logo />
          <div className="hidden max-w-md flex-col gap-5 lg:flex">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent-ink" aria-hidden="true">
              <KeyRound size={28} />
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground lg:text-5xl">{title}</h2>
            <p className="text-base leading-relaxed text-muted">{description}</p>
            <div className="mt-2 space-y-4 border-t border-line pt-6 text-sm text-secondary">
              <p className="flex items-start gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />Use o link enviado para o seu e-mail.</p>
              <p className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />Entre com sua senha para acessar seus registros.</p>
            </div>
          </div>
        </div>
      }
      right={children}
    />
  );
}
