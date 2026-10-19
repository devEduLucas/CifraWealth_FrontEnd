import { Link } from 'react-router-dom';
import { ArrowRight, Target, BarChart3, Wallet, PieChart, Layers } from 'lucide-react';

export function HomeFeatures({ isLogged }: {
  isLogged: boolean;
}) {
  return (<section id="recursos" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-line">
    <div className="text-center max-w-2xl mx-auto mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-ink text-xs font-bold uppercase tracking-wider mb-3">
        <Layers size={14} />
        <span>ECOSSISTEMA INTEGRADO</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
        Recursos pensados para o seu controle real.
      </h2>
      <p className="text-secondary text-base leading-relaxed">
        Diga adeus a anotações soltas e planilhas complexas. Conheça as ferramentas que transformam dados brutos em decisões claras.
      </p>
    </div>

    {/* Grid Estilo Bento com 4 cards distintos */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Card 1: Categorização Customizada (Ocupa 2 colunas em telas grandes) */}
      <article className="lg:col-span-2 rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent-ink flex items-center justify-center">
              <PieChart size={24} />
            </div>
            <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
              MÓDULO 01
            </span>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-2">
            Categorias personalizadas
          </h3>
          <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xl">
            Agrupe despesas por segmentos que façam sentido para o seu cotidiano. Veja instantaneamente a distribuição de gastos fixos, variáveis e investimentos mensais.
          </p>

          {/* Exibição Visual de Badges e Distribuição */}
          <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6">
            <div className="flex items-center justify-between text-xs text-muted mb-3">
              <span className="font-semibold text-foreground">Exemplo de Distribuição por Categoria</span>
              <span className="font-mono text-accent-ink">Total: R$ 4.210,00</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-foreground">Moradia & Contas</span>
                <span className="text-muted font-mono font-semibold">42%</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span className="text-foreground">Alimentação & Feira</span>
                <span className="text-muted font-mono font-semibold">24%</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-info" />
                <span className="text-foreground">Transporte</span>
                <span className="text-muted font-mono font-semibold">16%</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple" />
                <span className="text-foreground">Aportes & Lazer</span>
                <span className="text-muted font-mono font-semibold">18%</span>
              </div>
            </div>
          </div>
        </div>

        <Link to={isLogged ? '/categories' : '/register'} className="text-xs font-bold text-accent-ink inline-flex items-center gap-1.5 hover:underline">
          {isLogged ? 'Gerenciar minhas categorias' : 'Explorar organização de categorias'}{' '}
          <ArrowRight size={14} />
        </Link>
      </article>

      {/* Card 2: Metas Financeiras */}
      <article className="rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-progress/10 text-progress flex items-center justify-center">
              <Target size={24} />
            </div>
            <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
              MÓDULO 02
            </span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            Metas com acompanhamento de progresso
          </h3>
          <p className="text-sm text-secondary leading-relaxed mb-6">
            Defina metas para curto, médio e longo prazo. Monitore a porcentagem de conclusão com valores estipulados e prazos realistas.
          </p>

          {/* Exibição Visual de Metas */}
          <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-foreground font-semibold">Reserva de Emergência</span>
                <span className="text-progress font-mono font-bold">78%</span>
              </div>
              <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-progress rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-[10px] text-muted block mt-1">R$ 15.600 de R$ 20.000</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-foreground font-semibold">Viagem de Férias</span>
                <span className="text-progress font-mono font-bold">60%</span>
              </div>
              <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                <div className="h-full bg-progress rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-[10px] text-muted block mt-1">R$ 6.000 de R$ 10.000</span>
            </div>
          </div>
        </div>

        <Link to={isLogged ? '/goals' : '/register'} className="text-xs font-bold text-accent-ink inline-flex items-center gap-1.5 hover:underline">
          {isLogged ? 'Acessar minhas metas' : 'Definir objetivos'}{' '}
          <ArrowRight size={14} />
        </Link>
      </article>

      {/* Card 3: Registro de Transações */}
      <article className="rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-positive/10 text-positive flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
              MÓDULO 03
            </span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            Lançamentos Ágeis e Extrato
          </h3>
          <p className="text-sm text-secondary leading-relaxed mb-6">
            Registre despesas e receitas no computador ou celular. Confira data, categoria e valor no histórico, com filtros por período nos relatórios.
          </p>

          {/* Micro-preview de Lançamento */}
          <div className="bg-elevated/80 rounded-xl p-3.5 border border-line mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface border border-line">
              <span className="font-semibold text-foreground">Aporte Previdência</span>
              <span className="font-bold text-positive tabular-nums">+ R$ 1.200,00</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface border border-line">
              <span className="font-semibold text-foreground">Internet Fibra</span>
              <span className="font-bold text-danger tabular-nums">- R$ 149,90</span>
            </div>
          </div>
        </div>

        <Link to={isLogged ? '/transactions' : '/register'} className="text-xs font-bold text-accent-ink inline-flex items-center gap-1.5 hover:underline">
          {isLogged ? 'Ver todas as movimentações' : 'Conhecer extrato inteligente'}{' '}
          <ArrowRight size={14} />
        </Link>
      </article>

      {/* Card 4: Relatórios Analíticos (Ocupa 2 colunas em telas grandes) */}
      <article className="lg:col-span-2 rounded-2xl bg-surface border border-line p-7 flex flex-col justify-between hover:border-line-strong hover:shadow-lg transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple/15 text-purple flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs font-mono font-semibold text-muted bg-elevated px-2.5 py-1 rounded-lg border border-line">
              MÓDULO 04
            </span>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-2">
            Relatórios e Balanço Mensal
          </h3>
          <p className="text-sm text-secondary leading-relaxed mb-6 max-w-xl">
            Compare o saldo de meses anteriores com gráficos de barras verticais e fluxo de caixa consolidado. Enxergue a evolução da sua poupança de forma nítida.
          </p>

          {/* Exibição Visual de Gráfico de Barras */}
          <div className="bg-elevated/80 rounded-xl p-4 border border-line mb-6">
            <div className="flex items-center justify-between text-xs text-muted mb-3">
              <span className="font-semibold text-foreground">Fluxo de Caixa Mensal (Receitas vs Despesas)</span>
              <span className="text-positive font-bold font-mono">Saldo Positivo</span>
            </div>
            <div className="flex items-end gap-3 h-16 pt-2 border-t border-line/60">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-accent/40 rounded-t h-[50%]" />
                <span className="text-[10px] font-mono text-muted">Jul</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-accent/50 rounded-t h-[65%]" />
                <span className="text-[10px] font-mono text-muted">Ago</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-accent/70 rounded-t h-[78%]" />
                <span className="text-[10px] font-mono text-muted">Set</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-accent rounded-t h-[92%]" />
                <span className="text-[10px] font-mono text-accent-ink font-bold">Out</span>
              </div>
            </div>
          </div>
        </div>

        <Link to={isLogged ? '/reports' : '/register'} className="text-xs font-bold text-accent-ink inline-flex items-center gap-1.5 hover:underline">
          {isLogged ? 'Acessar relatórios completos' : 'Criar conta e ver relatórios'}{' '}
          <ArrowRight size={14} />
        </Link>
      </article>
    </div>
  </section>);
}
