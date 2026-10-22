import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, TrendingUp, Target, ShieldCheck, Wallet, PieChart, CheckCircle2, ArrowDownRight } from 'lucide-react';

export function HomeHero({ isLogged }: {
  isLogged: boolean;
}) {
  return (<section className="relative overflow-hidden py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 w-full">
    {/* Luzes de ambientação sutis */}
    <div data-parallax="-2" className="absolute -top-24 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
    <div data-parallax="-1" className="absolute top-1/2 -right-24 w-96 h-96 bg-info/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
      {/* Coluna de Texto & Chamada Principal */}
      <div data-reveal-stagger className="lg:col-span-7 flex flex-col items-start">
        {/* Badge Kicker */}
        <div data-reveal="up" className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent-ink text-xs font-semibold tracking-wide mb-6">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Controle financeiro pessoal</span>
        </div>

        {/* Título Principal de Impacto */}
        <h1 data-reveal="up" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
          Mais clareza para cuidar do seu{' '}
          <span className="text-accent-ink underline decoration-accent/30 decoration-wavy underline-offset-8">
            dinheiro
          </span>
          .
        </h1>

        {/* Descrição Concisa */}
        <p data-reveal="up" className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed mb-8">
          Registre suas receitas e despesas manualmente, organize categorias e acompanhe o dinheiro reservado para suas metas. Consulte relatórios para entender seus resultados, sem conectar contas bancárias.
        </p>

        {/* Ações Primárias / Secundárias */}
        {isLogged ? (<div data-reveal="up" className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
          <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-on-accent font-bold text-sm shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
            Acessar Painel Principal <ArrowRight size={18} />
          </Link>
        </div>) : (<div data-reveal="up" className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-on-accent font-bold text-sm shadow-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
            Começar Gratuitamente <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-secondary hover:text-foreground font-semibold text-sm transition-colors rounded-xl border border-line hover:bg-elevated hover:border-line-strong">
            Já tenho conta <ArrowUpRight size={16} className="text-muted" />
          </Link>
        </div>)}

        {/* Marcadores de Confiança */}
        <div data-reveal="up" className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-muted mt-8 pt-6 border-t border-line/80 w-full">
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-positive" />
            <span>Acesso protegido por autenticação</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-positive" />
            <span>Sem conexão com contas bancárias</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-positive" />
            <span>No computador e no celular</span>
          </div>
        </div>
      </div>

      {/* Coluna Visual: Mockup do Painel */}
      <div className="lg:col-span-5 relative">
        <div data-reveal="right" data-reveal-delay="2" className="relative rounded-2xl bg-surface border border-line-strong/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          {/* Cabeçalho da Janela Mockup */}
          <div className="flex flex-wrap items-center gap-3 pb-4 mb-5 border-b border-line">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-danger/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-warning/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-positive/80 inline-block" />
              <span className="ml-2 text-xs font-mono text-muted tracking-tight">cifrawealth.app/overview</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-positive/10 text-positive text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              <span>Exemplo ilustrativo</span>
            </div>
          </div>

          {/* Resumo do Saldo Consolidado */}
          <div className="bg-elevated/70 rounded-xl p-4 border border-line mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted">Saldo dos lançamentos</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-positive bg-surface px-2 py-0.5 rounded-md">
                <TrendingUp size={12} /> +12,4% no mês
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
              R$ 48.320,00
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-line/60">
              <div>
                <span className="text-[11px] text-muted block mb-0.5">Receitas</span>
                <span className="text-sm font-bold text-positive tabular-nums flex items-center gap-1">
                  <ArrowUpRight size={14} /> R$ 9.450,00
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted block mb-0.5">Despesas</span>
                <span className="text-sm font-bold text-danger tabular-nums flex items-center gap-1">
                  <ArrowDownRight size={14} /> R$ 4.210,00
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico SVG de Fluxo */}
          <div className="relative w-full h-32 mb-4 bg-elevated/40 rounded-xl p-3 border border-line">
            <div className="flex items-center justify-between text-[11px] text-muted font-medium mb-1">
              <span>Fluxo dos últimos 6 meses</span>
              <span className="text-positive font-semibold">Balanço Positivo</span>
            </div>
            <svg viewBox="0 0 420 90" className="w-full h-20 overflow-visible" role="img" aria-label="Gráfico de evolução financeira">
              <defs>
                <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 70 C40 65 70 50 110 55 S180 35 220 42 S290 20 330 25 S380 12 420 8 L420 90 L0 90 Z" fill="url(#heroGradient)" />
              <path d="M0 70 C40 65 70 50 110 55 S180 35 220 42 S290 20 330 25 S380 12 420 8" fill="none" stroke="rgb(var(--color-accent))" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-muted px-1">
              <span>MAI</span>
              <span>JUN</span>
              <span>JUL</span>
              <span>AGO</span>
              <span>SET</span>
              <span>OUT</span>
            </div>
          </div>

          {/* Micro-lista de Lançamentos Recentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted px-1">
              <span>Últimas movimentações</span>
              <Link to={isLogged ? '/transactions' : '/register'} className="text-accent-ink hover:underline">Ver todas</Link>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-elevated/50 border border-line text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-positive/10 text-positive flex items-center justify-center font-bold">
                  <Wallet size={14} />
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Salário e Dividendos</span>
                  <span className="text-[10px] text-muted block">Hoje · Renda Fixa</span>
                </div>
              </div>
              <span className="font-bold text-positive tabular-nums">+ R$ 7.500,00</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-elevated/50 border border-line text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-danger/15 text-danger flex items-center justify-center font-bold">
                  <PieChart size={14} />
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Mercado & Mantimentos</span>
                  <span className="text-[10px] text-muted block">Ontem · Alimentação</span>
                </div>
              </div>
              <span className="font-bold text-secondary tabular-nums">- R$ 420,00</span>
            </div>
          </div>
        </div>

        {/* Widget Flutuante Superior */}
        <div data-parallax="2" className="hidden sm:block absolute -top-4 -right-4">
        <div data-reveal="scale" data-reveal-delay="4" className="flex bg-surface/95 border border-line-strong rounded-xl p-3.5 shadow-xl items-center gap-3 backdrop-blur-sm">
          <div className="w-9 h-9 rounded-lg bg-progress/10 text-progress flex items-center justify-center">
            <Target size={18} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-foreground">Reserva de Emergência</span>
              <span className="text-xs font-mono font-bold text-progress">78%</span>
            </div>
            <div className="w-32 h-1.5 bg-line rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-progress rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
        </div>

        {/* Widget Flutuante Inferior */}
        <div data-parallax="-1" className="hidden sm:block absolute -bottom-4 -left-4">
        <div data-reveal="scale" data-reveal-delay="5" className="flex bg-surface/95 border border-line-strong rounded-xl p-3 shadow-xl items-center gap-2.5 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-lg bg-info/15 text-info flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <b className="text-xs text-foreground block">Registros por conta</b>
            <span className="text-[10px] text-muted block">Seu planejamento em um só lugar</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>);
}
