import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Clock, Plus, Minus, Target, TrendingDown, TrendingUp, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import { useSessionUser } from '../hooks/useSessionUser';
import { api, type CategoryResponse, type GoalResponse, type MonthlyReportItem, type TransactionResponse } from '../lib/api';
import { formatCurrency, formatRelativeDate, SHORT_MONTH_LABELS } from '../utils/validation';
import type { ChartPoint, GoalItem, TransactionItem } from '../types/dashboard.types';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { DashboardHeader } from '../components/DashboardHeader/DashboardHeader';
import { BalanceCard } from '../components/BalanceCard/BalanceCard';
import { SummaryCard } from '../components/SummaryCard/SummaryCard';
import { QuickActionButton } from '../components/QuickActionButton/QuickActionButton';
import { FinanceChart } from '../components/FinanceChart/FinanceChart';
import { TransactionList } from '../components/TransactionList/TransactionList';
import { GoalCard } from '../components/GoalCard/GoalCard';
import { localDateOnly } from '../utils/reports';
import { dashboardPeriods, expenseComparison } from '../utils/dashboard';

export function DashboardPage() {
  const { valuesVisible } = useFinancialPrivacy();
  const user = useSessionUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const firstName = fullName.split(' ')[0];
  const today = localDateOnly();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const period = useMemo(() => dashboardPeriods(new Date(`${today}T12:00:00`)), [today]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [monthly, setMonthly] = useState<MonthlyReportItem[]>([]);
  const [comparison, setComparison] = useState<ReturnType<typeof expenseComparison>>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [retry, setRetry] = useState(0);
  const [available, setAvailable] = useState({ balance: false, monthly: false, goals: false, transactions: false });

  useEffect(() => {
    setLoading(true);
    setError(null);
    setHasHistory(null);
    setComparison(null);
    let active = true;
    const currentReport = api.getMonthlyReport(currentYear, today);
    const monthlyPromise = currentMonthIndex < 5
      ? Promise.all([api.getMonthlyReport(currentYear - 1, today), currentReport]).then(([previous, current]) => [...previous, ...current])
      : currentReport;
    const comparisonPromise = Promise.all([
      period.currentComparisonEnd === today ? currentReport : api.getMonthlyReport(currentYear, period.currentComparisonEnd),
      api.getMonthlyReport(period.previousYear, period.previousComparisonEnd),
    ]).then(([current, previous]) => expenseComparison(
      current.find((item) => item.mes === period.currentMonth),
      previous.find((item) => item.mes === period.previousMonth),
      period.comparisonDays,
    ));

    Promise.allSettled([
      api.getDashboard(),
      monthlyPromise,
      api.listTransactions({ status: 'confirmada', data_fim: today, limit: 5 }),
      api.listCategories(),
      api.listGoals(),
      // No filters: pending and future entries also mean the account has history.
      api.listTransactions({ limit: 1 }),
      comparisonPromise,
    ]).then(([dashboard, monthlyReport, transactionsResult, categoriesResult, goalsResult, historyResult, comparisonResult]) => {
      if (!active) return;
      setAvailable({
        balance: dashboard.status === 'fulfilled',
        monthly: monthlyReport.status === 'fulfilled',
        transactions: transactionsResult.status === 'fulfilled',
        goals: goalsResult.status === 'fulfilled',
      });
      if (dashboard.status === 'fulfilled') setSaldo(dashboard.value.saldo);
      if (monthlyReport.status === 'fulfilled') setMonthly(monthlyReport.value);
      if (transactionsResult.status === 'fulfilled') setTransactions(transactionsResult.value);
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value);
      if (goalsResult.status === 'fulfilled') setGoals(goalsResult.value);
      if (historyResult.status === 'fulfilled') setHasHistory(historyResult.value.length > 0);
      if (comparisonResult.status === 'fulfilled') setComparison(comparisonResult.value);
      const coreFailures = [dashboard, monthlyReport, transactionsResult, categoriesResult, goalsResult, historyResult].filter((item) => item.status === 'rejected');
      if (coreFailures.length) setError('Não foi possível carregar parte do seu resumo. Seus registros continuam salvos; tente novamente.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentYear, currentMonthIndex, retry, today, period]);

  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id_categoria, category])), [categories]);
  const currentMonthItem = monthly.find((item) => item.mes === period.currentMonth);
  const receitasMes = currentMonthItem?.total_receitas ?? 0;
  const despesasMes = currentMonthItem?.total_despesas ?? 0;
  const resultadoMes = receitasMes - despesasMes;
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, (letter) => letter.toUpperCase());
  const chartSlice = monthly
    .filter((item) => item.mes <= period.currentMonth)
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6);
  const chartData: ChartPoint[] = chartSlice.map((item) => ({
    month: SHORT_MONTH_LABELS[Number(item.mes.slice(5, 7)) - 1],
    receitas: item.total_receitas,
    despesas: item.total_despesas,
  }));
  const chartSubtitle = chartSlice.length <= 1 ? 'Este mês · até hoje' : `Últimos ${chartSlice.length} meses · mês atual até hoje`;
  const chartYears = [...new Set(chartSlice.map((item) => item.mes.slice(0, 4)))].join('–') || currentYear;
  const recentTransactions: TransactionItem[] = useMemo(() => transactions
    .filter((transaction) => transaction.status === 'confirmada' && transaction.data_transacao.slice(0, 10) <= today)
    .sort((a, b) => b.data_transacao.localeCompare(a.data_transacao))
    .slice(0, 5)
    .map((transaction) => {
      const category = categoriesById.get(transaction.id_categoria);
      return {
        id: transaction.id_transacao, descricao: transaction.descricao,
        categoriaNome: category?.nome ?? 'Sem categoria', tipo: transaction.tipo,
        cor: category?.cor ?? null, valor: transaction.valor, data: formatRelativeDate(transaction.data_transacao),
      };
    }), [transactions, categoriesById, today]);
  const activeGoals = goals.filter((goal) => goal.status === 'em_andamento');
  const goalItems: GoalItem[] = activeGoals.slice(0, 3).map((goal) => ({
    id: goal.id_meta, nome: goal.titulo, valorAtual: goal.valor_atual, valorAlvo: goal.valor_objetivo,
  }));
  // A zero net balance is not an empty account. Avoid onboarding on partial failures.
  const firstUse = hasHistory === false && available.balance && available.transactions && saldo === 0 && transactions.length === 0;

  return (
    <DashboardLayout userName={fullName}>
      <DashboardHeader firstName={firstName} />
      {!valuesVisible && <p role="status" className="mb-4 text-xs text-muted">Privacidade ativada: valores, percentuais e gráfico ocultos nesta visão geral.</p>}
      {loading && <p role="status" className="py-6 text-sm text-muted">Carregando seu resumo...</p>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        <p>{error}</p><button type="button" onClick={() => setRetry((old) => old + 1)} className="min-h-11 font-semibold underline">Tentar novamente</button>
      </div>}
      {!loading && <>
        {firstUse ? (
          <section aria-labelledby="first-record-title" className="rounded-2xl border border-accent/25 bg-surface p-5 sm:p-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent-ink"><Plus size={24} aria-hidden="true" /></span>
            <h2 id="first-record-title" className="mt-4 text-2xl font-bold text-foreground">Seu controle começa com o primeiro registro</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">Adicione uma receita ou despesa. Depois, seu saldo, resumo do mês e movimentações aparecem aqui, organizados automaticamente.</p>
            <Link to="/transactions?new=1" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover">Registrar primeira movimentação <ArrowRight size={17} aria-hidden="true" /></Link>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted"><CheckCircle2 size={16} aria-hidden="true" className="shrink-0 text-positive" />Suas categorias já estão prontas para usar. Você pode personalizá-las quando quiser.</p>
            <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              {[['1. Registre', 'Informe o valor, a data e a categoria.'], ['2. Confira', 'Acompanhe os registros confirmados no seu resumo.'], ['3. Planeje', 'Crie uma meta quando fizer sentido para você.']].map(([title, description]) => <div key={title}><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted">{description}</p></div>)}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted">Você registra as movimentações manualmente. O CifraWealth não conecta contas bancárias nem movimenta dinheiro.</p>
          </section>
        ) : <>
          {available.balance ? <BalanceCard total={saldo} valuesVisible={valuesVisible} /> : <p className="text-sm text-muted">Saldo indisponível no momento.</p>}
          <section aria-label="Registrar movimentação" className="mt-3 grid grid-cols-2 gap-3">
            <QuickActionButton label="Registrar receita" icon={Plus} iconClassName="bg-positive/10 text-positive" to="/transactions?new=1&tipo=receita" />
            <QuickActionButton label="Registrar despesa" icon={Minus} iconClassName="bg-danger/15 text-danger" to="/transactions?new=1&tipo=despesa" />
          </section>
          {available.monthly && <section aria-labelledby="month-summary-title" className="mt-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
              <h2 id="month-summary-title" className="text-base font-semibold text-foreground">{monthLabel}</h2>
              <p className="text-xs text-muted">Registros confirmados até hoje</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SummaryCard compact label="Receitas" value={valuesVisible ? formatCurrency(receitasMes) : 'R$ ••••••'} icon={TrendingUp} iconClassName="bg-positive/10 text-positive" footnote="Entradas do mês" footnoteClassName="text-muted" />
              <SummaryCard compact label="Despesas" value={valuesVisible ? formatCurrency(despesasMes) : 'R$ ••••••'} icon={TrendingDown} iconClassName="bg-danger/15 text-danger" footnote={valuesVisible && comparison ? comparison.text : 'Saídas do mês'} footnoteClassName={valuesVisible && comparison ? comparison.tone : 'text-muted'} />
              <div className="col-span-2 sm:col-span-1"><SummaryCard compact label="Resultado do mês" value={valuesVisible ? formatCurrency(resultadoMes) : 'R$ ••••••'} icon={Clock} iconClassName="bg-info/15 text-info" footnote="Receitas menos despesas deste mês" footnoteClassName="text-muted" /></div>
            </div>
          </section>}
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {available.transactions ? <TransactionList transactions={recentTransactions} valuesVisible={valuesVisible} /> : <p className="text-sm text-muted">Últimas movimentações indisponíveis.</p>}
            {!valuesVisible ? <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center"><EyeOff size={24} aria-hidden="true" className="text-subtle" /><h2 className="text-base font-semibold text-foreground">Gráfico oculto</h2><p className="text-sm text-muted">Ative “Mostrar valores” para consultar a evolução financeira.</p></div> : available.monthly ? <FinanceChart data={chartData} year={chartYears} subtitle={chartSubtitle} /> : <p className="text-sm text-muted">Resumo mensal indisponível.</p>}
          </div>
        </>}
        {available.goals && <section aria-labelledby="dashboard-goals-title" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="dashboard-goals-title" className="flex items-center gap-2 text-base font-semibold text-foreground"><Target size={18} aria-hidden="true" className="text-progress" />Suas metas{activeGoals.length > 0 ? ` · ${activeGoals.length} em andamento` : ''}</h2>
            <Link to={activeGoals.length > 0 ? '/goals' : '/goals?new=1'} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink hover:underline">{activeGoals.length > 0 ? 'Ver todas as metas →' : 'Criar uma meta →'}</Link>
          </div>
          {goalItems.length > 0 ? <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{goalItems.map((goal) => <GoalCard key={goal.id} goal={goal} valuesVisible={valuesVisible} />)}</div> : <p className="text-sm text-muted">Quando quiser planejar um objetivo, acompanhe aqui o dinheiro que já reservou.</p>}
        </section>}
        {!available.goals && <p className="mt-6 text-sm text-muted">Metas indisponíveis no momento. Use “Tentar novamente” acima.</p>}
      </>}
    </DashboardLayout>
  );
}
