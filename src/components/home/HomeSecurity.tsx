import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function HomeSecurity() {
  return (
    <section id="seguranca" className="w-full border-t border-line px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div data-reveal="up" className="mx-auto flex max-w-7xl items-start gap-4">
        <ShieldCheck size={28} aria-hidden="true" className="mt-1 shrink-0 text-accent-ink" />
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Seus registros, com acesso pela sua conta</h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary">Você acessa seus registros pela sua conta, sem informar senhas bancárias. O CifraWealth não conecta contas, não movimenta dinheiro e não substitui o saldo informado pelo seu banco.</p>
          <Link to="/politica-de-privacidade" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink hover:underline">Entenda como seus dados são tratados →</Link>
        </div>
      </div>
    </section>
  );
}
