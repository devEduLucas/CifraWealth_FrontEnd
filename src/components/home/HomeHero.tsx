import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ArrowDownRight, CheckCircle2, Plus, Minus } from 'lucide-react';

export function HomeHero({ isLogged }: { isLogged: boolean }) {
  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div data-reveal-stagger>
          <p data-reveal="up" className="mb-4 text-sm font-semibold text-accent-ink">Controle financeiro pessoal</p>
          <h1 data-reveal="up" className="text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Mais clareza para cuidar do seu <span className="text-accent-ink">dinheiro.</span>
          </h1>
          <p data-reveal="up" className="mt-5 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
            Registre receitas e despesas, entenda seus gastos e acompanhe suas metas. Você organiza tudo manualmente, sem conectar contas bancárias.
          </p>
          <div data-reveal="up" className="mt-7 flex flex-wrap gap-3">
            <Link to={isLogged ? '/dashboard' : '/register'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-on-accent transition-colors hover:bg-accent-hover sm:w-auto">
              {isLogged ? 'Ir para minha visão geral' : 'Criar conta gratuita'} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {!isLogged && <Link to="/login" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-elevated sm:w-auto">Já tenho conta <ArrowUpRight size={16} aria-hidden="true" /></Link>}
          </div>
          <p data-reveal="up" className="mt-5 flex items-center gap-2 text-xs text-muted"><CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-positive" />No computador e no celular, com categorias prontas para começar.</p>
        </div>

        <figure data-reveal="up" className="min-w-0 rounded-2xl border border-line-strong bg-surface p-4 shadow-lg sm:p-6" aria-label="Exemplo ilustrativo da visão geral financeira">
          <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <span className="text-sm font-semibold text-foreground">Sua visão geral</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-ink">Exemplo ilustrativo</span>
          </figcaption>
          <p className="text-xs text-muted">Saldo acumulado dos registros</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-foreground">R$ 2.350,00</p>
          <p className="mt-1 text-xs text-muted">Receitas menos despesas confirmadas</p>
          <div className="mt-4 grid grid-cols-2 gap-2" aria-hidden="true">
            <span className="flex items-center justify-center gap-2 rounded-lg bg-positive/10 px-2 py-2.5 text-xs font-semibold text-positive"><Plus size={15} />Registrar receita</span>
            <span className="flex items-center justify-center gap-2 rounded-lg bg-danger/10 px-2 py-2.5 text-xs font-semibold text-danger"><Minus size={15} />Registrar despesa</span>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-3 text-xs font-semibold text-secondary">Resumo de um mês de exemplo</p>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-xs text-muted">Receitas</span><p className="mt-1 flex items-center gap-1 text-base font-bold tabular-nums text-positive"><ArrowUpRight size={16} aria-hidden="true" />R$ 4.000,00</p></div>
              <div><span className="text-xs text-muted">Despesas</span><p className="mt-1 flex items-center gap-1 text-base font-bold tabular-nums text-danger"><ArrowDownRight size={16} aria-hidden="true" />R$ 1.650,00</p></div>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-3 text-xs font-semibold text-secondary">Últimas movimentações</p>
            <div className="flex items-center justify-between gap-3 py-2 text-xs"><span className="text-foreground">Salário <span className="block text-muted">Receita · Trabalho</span></span><span className="font-semibold tabular-nums text-positive">+ R$ 4.000,00</span></div>
            <div className="flex items-center justify-between gap-3 py-2 text-xs"><span className="text-foreground">Compras do mercado <span className="block text-muted">Despesa · Alimentação</span></span><span className="font-semibold tabular-nums text-danger">− R$ 350,00</span></div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">Valores fictícios para demonstrar o produto. Nenhuma conta bancária é consultada.</p>
        </figure>
      </div>
    </section>
  );
}
