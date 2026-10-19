import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function HomeCallToAction({ isLogged }: {
  isLogged: boolean;
}) {
  return (<section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 w-full">
    <div className="rounded-3xl bg-gradient-to-br from-surface via-elevated to-surface border border-line-strong p-8 sm:p-12 md:p-16 text-center shadow-xl relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-accent-ink uppercase mb-3 block">
          COMECE HOJE MESMO
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
          Pronto para transformar sua organização financeira?
        </h2>
        <p className="text-secondary text-base leading-relaxed mb-8">
          Crie sua conta, confirme seu e-mail e comece pelos seus primeiros lançamentos. Se já tem acesso, entre no painel.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
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
