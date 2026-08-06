import { useEffect, useState } from 'react';
import { Clock, Plus, Minus, Settings, TrendingDown, TrendingUp } from 'lucide-react';
import { session } from '../lib/session';
import {
  api,
  ApiError,
  type CategoryResponse,
  type GoalResponse,
  type MonthlyReportItem,
  type TransactionResponse,
} from '../lib/api';
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

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH_INDEX = new Date().getMonth();

export function DashboardPage() {
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [monthly, setMonthly] = useState<MonthlyReportItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [goals, setGoals] = useState<GoalResponse[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDashboard(),
      api.getMonthlyReport(CURRENT_YEAR),
      api.listTransactions(),
      api.listCategories(),
      api.listGoals(),
    ])
      .then(([dashboard, monthlyReport, transactionsResult, categoriesResult, goalsResult]) => {
        setSaldo(dashboard.saldo);
        setMonthly(monthlyReport);
        setTransactions(transactionsResult);
        setCategories(categoriesResult);
        setGoals(goalsResult);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar o dashboard.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categoriesById = new Map(categories.map((category) => [category.id_categoria, category]));

  const currentMonthItem = monthly[CURRENT_MONTH_INDEX];
  const previousMonthItem = CURRENT_MONTH_INDEX > 0 ? monthly[CURRENT_MONTH_INDEX - 1] : undefined;

  const receitasMes = currentMonthItem?.total_receitas ?? 0;
  const despesasMes = currentMonthItem?.total_despesas ?? 0;
  const economiaMes = receitasMes - despesasMes;
  const economiaPercentual = receitasMes > 0 ? Math.round((economiaMes / receitasMes) * 100) : 0;

  const despesasVariacao =
    previousMonthItem && previousMonthItem.total_despesas > 0
      ? Math.round(((despesasMes - previousMonthItem.total_despesas) / previousMonthItem.total_despesas) * 100)
      : null;

  const chartSlice = monthly.slice(Math.max(0, CURRENT_MONTH_INDEX - 5), CURRENT_MONTH_INDEX + 1);
  const chartData: ChartPoint[] = chartSlice.map((item) => {
    const monthNumber = Number(item.mes.slice(5, 7));
    return {
      month: SHORT_MONTH_LABELS[monthNumber - 1],
      receitas: item.total_receitas,
      despesas: item.total_despesas,
    };
  });
  const chartSubtitle = chartSlice.length <= 1 ? 'Este mês' : `Últimos ${chartSlice.length} meses`;

  const recentTransactions: TransactionItem[] = [...transactions]
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
    });

  const activeGoals = goals.filter((goal) => goal.status === 'em_andamento');
  const goalItems: GoalItem[] = activeGoals.map((goal) => ({
    id: goal.id_meta,
    nome: goal.titulo,
    valorAtual: goal.valor_atual,
    valorAlvo: goal.valor_objetivo,
  }));

  return (
    <DashboardLayout userName={fullName}>
      <DashboardHeader firstName={firstName} initials={initials} />

      {loading && <p className="text-sm text-slate-400">Carregando dados financeiros...</p>}
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <BalanceCard total={saldo} />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Receitas"
              value={formatCurrency(receitasMes)}
              icon={TrendingUp}
              iconClassName="bg-teal-500/15 text-teal-400"
              footnote="Este mês"
              footnoteClassName="text-teal-400"
            />
            <SummaryCard
              label="Despesas"
              value={formatCurrency(despesasMes)}
              icon={TrendingDown}
              iconClassName="bg-red-500/15 text-red-400"
              footnote={
                despesasVariacao === null
                  ? 'Este mês'
                  : `${despesasVariacao > 0 ? '↑' : '↓'} ${despesasVariacao}% vs mês anterior`
              }
              footnoteClassName="text-red-400"
            />
            <SummaryCard
              label="Economia"
              value={formatCurrency(economiaMes)}
              icon={Clock}
              iconClassName="bg-sky-500/15 text-sky-400"
              footnote={receitasMes > 0 ? `${economiaPercentual}% da receita` : 'Este mês'}
              footnoteClassName="text-sky-400"
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações Rápidas
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <QuickActionButton
                label="Adicionar Receita"
                icon={Plus}
                iconClassName="bg-teal-500/15 text-teal-400"
                to="/transactions"
              />
              <QuickActionButton
                label="Adicionar Despesa"
                icon={Minus}
                iconClassName="bg-red-500/15 text-red-400"
                to="/transactions"
              />
              <QuickActionButton
                label="Criar Meta"
                icon={Settings}
                iconClassName="bg-sky-500/15 text-sky-400"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <FinanceChart data={chartData} year={CURRENT_YEAR} subtitle={chartSubtitle} />
            <TransactionList transactions={recentTransactions} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Metas Financeiras</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {goalItems.length} {goalItems.length === 1 ? 'meta em andamento' : 'metas em andamento'}
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400"
              >
                + Nova meta
              </button>
            </div>

            {goalItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-[#202634] bg-[#121827] p-8 text-center">
                <p className="text-sm text-slate-400">Nenhuma meta criada ainda.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goalItems.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
