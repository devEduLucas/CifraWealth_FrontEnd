import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  EyeOff,
} from 'lucide-react';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import { useSessionUser } from '../hooks/useSessionUser';
import {
  api,
  ApiError,
  type CategoryResponse,
  type GoalResponse,
  type MonthlyReportItem,
  type TransactionResponse,
} from '../lib/api';
import {
  formatCurrency,
  formatRelativeDate,
  SHORT_MONTH_LABELS,
} from '../utils/validation';
import type {
  ChartPoint,
  GoalItem,
  TransactionItem,
} from '../types/dashboard.types';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { DashboardHeader } from '../components/DashboardHeader/DashboardHeader';
import { BalanceCard } from '../components/BalanceCard/BalanceCard';
import { SummaryCard } from '../components/SummaryCard/SummaryCard';
import { QuickActionButton } from '../components/QuickActionButton/QuickActionButton';
import { FinanceChart } from '../components/FinanceChart/FinanceChart';
import { TransactionList } from '../components/TransactionList/TransactionList';
import { GoalCard } from '../components/GoalCard/GoalCard';
import { localDateOnly } from '../utils/reports';

export function DashboardPage() {
  const { valuesVisible } = useFinancialPrivacy();
  const user = useSessionUser();
  const fullName = user
    ? `${user.nome} ${user.sobrenome ?? ''}`.trim()
    : 'Usuário';
  const firstName = fullName.split(' ')[0];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [monthly, setMonthly] = useState<MonthlyReportItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [retry, setRetry] = useState(0);
  const [available, setAvailable] = useState({
    balance: false,
    monthly: false,
    goals: false,
    transactions: false,
  });
  const today = localDateOnly();

  useEffect(() => {
    setLoading(true);
    setError(null);
    let active = true;
    // When in early months of the year, fetch previous year too for continuous 6-month chart
    const monthlyPromise =
      currentMonthIndex < 5
        ? Promise.all([
            api.getMonthlyReport(currentYear - 1, today),
            api.getMonthlyReport(currentYear, today),
          ]).then(([prev, cur]) => [...prev, ...cur])
        : api.getMonthlyReport(currentYear, today);

    Promise.allSettled([
      api.getDashboard(),
      monthlyPromise,
      api.listTransactions({ status: 'confirmada', data_fim: today, limit: 6 }),
      api.listCategories(),
      api.listGoals(),
    ])
      .then(
        ([
          dashboard,
          monthlyReport,
          transactionsResult,
          categoriesResult,
          goalsResult,
        ]) => {
          if (!active) return;
          setAvailable({
            balance: dashboard.status === 'fulfilled',
            monthly: monthlyReport.status === 'fulfilled',
            transactions: transactionsResult.status === 'fulfilled',
            goals: goalsResult.status === 'fulfilled',
          });
          if (dashboard.status === 'fulfilled') setSaldo(dashboard.value.saldo);
          if (monthlyReport.status === 'fulfilled')
            setMonthly(monthlyReport.value);
          if (transactionsResult.status === 'fulfilled')
            setTransactions(transactionsResult.value);
          if (categoriesResult.status === 'fulfilled')
            setCategories(categoriesResult.value);
          if (goalsResult.status === 'fulfilled') setGoals(goalsResult.value);
          const failures = [
            dashboard,
            monthlyReport,
            transactionsResult,
            categoriesResult,
            goalsResult,
          ].filter((item) => item.status === 'rejected');
          if (failures.length)
            setError(
              failures
                .map((item) =>
                  item.status === 'rejected' && item.reason instanceof ApiError
                    ? item.reason.message
                    : 'Parte dos dados está indisponível.',
                )
                .filter((text, index, values) => values.indexOf(text) === index)
                .join(' '),
            );
        },
      )
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentYear, currentMonthIndex, retry, today]);

  const categoriesById = useMemo(
    () =>
      new Map(categories.map((category) => [category.id_categoria, category])),
    [categories],
  );

  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const currentMonthItemIndex = monthly.findIndex(
    (item) => item.mes === currentMonthKey,
  );
  const currentMonthItem =
    currentMonthItemIndex >= 0
      ? monthly[currentMonthItemIndex]
      : monthly[monthly.length - 1];
  const previousMonthItem =
    currentMonthItemIndex > 0 ? monthly[currentMonthItemIndex - 1] : undefined;

  const receitasMes = currentMonthItem?.total_receitas ?? 0;
  const despesasMes = currentMonthItem?.total_despesas ?? 0;
  const economiaMes = receitasMes - despesasMes;
  const economiaPercentual =
    receitasMes > 0 ? Math.round((economiaMes / receitasMes) * 100) : 0;

  const despesasVariacao =
    previousMonthItem && previousMonthItem.total_despesas > 0
      ? Math.round(
          ((despesasMes - previousMonthItem.total_despesas) /
            previousMonthItem.total_despesas) *
            100,
        )
      : null;

  // Last 6 months up to current month
  const targetEndIndex =
    currentMonthItemIndex >= 0 ? currentMonthItemIndex + 1 : monthly.length;
  const chartSlice = monthly.slice(
    Math.max(0, targetEndIndex - 6),
    targetEndIndex,
  );
  const chartData: ChartPoint[] = chartSlice.map((item) => {
    const monthNumber = Number(item.mes.slice(5, 7));
    return {
      month: SHORT_MONTH_LABELS[monthNumber - 1],
      receitas: item.total_receitas,
      despesas: item.total_despesas,
    };
  });
  const chartSubtitle =
    chartSlice.length <= 1 ? 'Este mês' : `Últimos ${chartSlice.length} meses`;

  const recentTransactions: TransactionItem[] = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.status === 'confirmada')
        .sort((a, b) => b.data_transacao.localeCompare(a.data_transacao))
        .slice(0, 6)
        .map((transaction) => {
          const category = categoriesById.get(transaction.id_categoria);

          return {
            id: transaction.id_transacao,
            descricao: transaction.descricao,
            categoriaNome: category?.nome ?? 'Sem categoria',
            tipo: transaction.tipo,
            cor: category?.cor ?? null,
            valor: transaction.valor,
            data: formatRelativeDate(transaction.data_transacao),
          };
        }),
    [transactions, categoriesById],
  );

  const activeGoals = goals.filter((goal) => goal.status === 'em_andamento');
  const goalItems: GoalItem[] = activeGoals.map((goal) => ({
    id: goal.id_meta,
    nome: goal.titulo,
    valorAtual: goal.valor_atual,
    valorAlvo: goal.valor_objetivo,
  }));

  return (
    <DashboardLayout userName={fullName}>
      <DashboardHeader firstName={firstName} />

      <section
        aria-labelledby="quick-actions-title"
        className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5"
      >
        <div className="mb-4">
          <h2
            id="quick-actions-title"
            className="text-base font-bold text-foreground"
          >
            O que vamos organizar hoje?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Registre uma movimentação ou dê o primeiro passo para uma meta.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickActionButton
            label="Adicionar Receita"
            icon={Plus}
            iconClassName="bg-positive/10 text-positive"
            to="/transactions?new=1&tipo=receita"
          />
          <QuickActionButton
            label="Adicionar Despesa"
            icon={Minus}
            iconClassName="bg-danger/15 text-danger"
            to="/transactions?new=1&tipo=despesa"
          />
          <QuickActionButton
            label="Criar Meta"
            icon={Target}
            iconClassName="bg-info/15 text-info"
            to="/goals?new=1"
          />
        </div>
      </section>
      {!valuesVisible && (
        <p role="status" className="mb-4 text-xs text-muted">
          Privacidade ativada: valores, percentuais e gráfico ocultos neste
          dashboard.
        </p>
      )}

      {loading && (
        <p className="text-sm text-muted">Carregando dados financeiros...</p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <p>{error}</p>
          <button
            onClick={() => setRetry((old) => old + 1)}
            className="min-h-11 font-semibold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && (
        <>
          {available.balance ? (
            <BalanceCard total={saldo} valuesVisible={valuesVisible} />
          ) : (
            <p className="text-sm text-muted">Saldo indisponível no momento.</p>
          )}

          {available.monthly && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Receitas"
                value={
                  valuesVisible ? formatCurrency(receitasMes) : 'R$ ••••••'
                }
                icon={TrendingUp}
                iconClassName="bg-positive/10 text-positive"
                footnote="Este mês, até hoje"
                footnoteClassName="text-positive"
              />
              <SummaryCard
                label="Despesas"
                value={
                  valuesVisible ? formatCurrency(despesasMes) : 'R$ ••••••'
                }
                icon={TrendingDown}
                iconClassName="bg-danger/15 text-danger"
                footnote={
                  !valuesVisible || despesasVariacao === null
                    ? 'Este mês, até hoje'
                    : `${despesasVariacao > 0 ? '↑' : '↓'} ${despesasVariacao}% vs mês anterior`
                }
                footnoteClassName="text-danger"
              />
              <SummaryCard
                label="Resultado do mês"
                value={
                  valuesVisible ? formatCurrency(economiaMes) : 'R$ ••••••'
                }
                icon={Clock}
                iconClassName="bg-info/15 text-info"
                footnote={
                  valuesVisible && receitasMes > 0
                    ? `${economiaPercentual}% da receita · até hoje`
                    : 'Este mês, até hoje'
                }
                footnoteClassName="text-info"
              />
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            {!valuesVisible ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center">
                <EyeOff size={24} aria-hidden="true" className="text-subtle" />
                <h2 className="text-base font-semibold text-foreground">
                  Gráfico oculto
                </h2>
                <p className="text-sm text-muted">
                  Ative “Mostrar valores” para consultar a evolução financeira.
                </p>
              </div>
            ) : available.monthly ? (
              <FinanceChart
                data={chartData}
                year={currentYear}
                subtitle={chartSubtitle + ' · até hoje'}
              />
            ) : (
              <p className="text-sm text-muted">Resumo mensal indisponível.</p>
            )}
            {available.transactions ? (
              <TransactionList
                transactions={recentTransactions}
                valuesVisible={valuesVisible}
              />
            ) : (
              <p className="text-sm text-muted">
                Últimos lançamentos indisponíveis.
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Metas Financeiras
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {goalItems.length}{' '}
                  {goalItems.length === 1
                    ? 'meta em andamento'
                    : 'metas em andamento'}
                </p>
              </div>
              <Link
                to="/goals?new=1"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              >
                + Nova meta
              </Link>
            </div>

            {!available.goals ? (
              <p className="mt-4 text-sm text-muted">
                Metas indisponíveis no momento. Use “Tentar novamente” acima.
              </p>
            ) : goalItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-line bg-surface p-8 text-center">
                <p className="text-sm text-muted">Nenhuma meta criada ainda.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goalItems.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    valuesVisible={valuesVisible}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
