import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function HomeCallToAction({ isLogged }: {
  isLogged: boolean;
}) {
  return (<section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 w-full">
    <div data-reveal="up" className="mx-auto max-w-7xl rounded-2xl bg-surface border border-line p-6 sm:p-8 text-center relative overflow-hidden">
      <div data-parallax="-2" className="absolute -top-16 -left-16 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div data-parallax="2" className="absolute -bottom-20 -right-16 w-80 h-80 bg-progress/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div data-reveal-stagger className="relative z-10 max-w-2xl mx-auto">
        <span data-reveal="up" className="text-xs font-bold tracking-widest text-accent-ink uppercase mb-3 block">
          {isLogged ? 'SEU CONTROLE FINANCEIRO' : 'COMECE HOJE MESMO'}
        </span>
        <h2 data-reveal="up" className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
          {isLogged ? 'Continue de onde parou' : 'Comece pelo primeiro registro'}
        </h2>
        <p data-reveal="up" className="text-secondary text-base leading-relaxed mb-8">
          {isLogged ? 'Volte à sua visão geral para consultar seu resumo ou registrar uma movimentação.' : 'Crie sua conta, confirme seu e-mail e comece pelos seus primeiros lançamentos. Se já tem acesso, entre no painel.'}
        </p>

        <div data-reveal="up" className="flex flex-wrap items-center justify-center gap-3.5">
          {isLogged ? (<>
            <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-on-accent text-sm font-bold shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
              Ir para o Painel <ArrowRight size={18} />
            </Link>
          </>) : (<>
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-on-accent text-sm font-bold shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
              Criar conta gratuita <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-secondary hover:text-foreground text-sm font-semibold transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong">
              Acessar conta existente <ArrowUpRight size={16} className="text-muted" />
            </Link>
          </>)}
        </div>
      </div>
    </div>
  </section>);
}
