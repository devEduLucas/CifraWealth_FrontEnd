import { Clock, Plus, Minus, Settings, TrendingDown, TrendingUp } from 'lucide-react';
import { session } from '../lib/session';
import {
  mockBalance,
  mockChartData,
  mockGoals,
  mockSummary,
  mockTransactions,
} from '../lib/mockDashboard';
import { formatCurrency } from '../utils/validation';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { DashboardHeader } from '../components/DashboardHeader/DashboardHeader';
import { BalanceCard } from '../components/BalanceCard/BalanceCard';
import { SummaryCard } from '../components/SummaryCard/SummaryCard';
import { QuickActionButton } from '../components/QuickActionButton/QuickActionButton';
import { FinanceChart } from '../components/FinanceChart/FinanceChart';
import { TransactionList } from '../components/TransactionList/TransactionList';
import { GoalCard } from '../components/GoalCard/GoalCard';

export function DashboardPage() {
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Eduardo M.';
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DashboardLayout userName={fullName}>
      <DashboardHeader firstName={firstName} initials={initials} />

      <BalanceCard total={mockBalance.total} variacaoPercentual={mockBalance.variacaoPercentual} />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Receitas"
          value={formatCurrency(mockSummary.receitas)}
          icon={TrendingUp}
          iconClassName="bg-emerald-500/15 text-emerald-400"
          footnote="↑ Este mês"
          footnoteClassName="text-emerald-400"
        />
        <SummaryCard
          label="Despesas"
          value={formatCurrency(mockSummary.despesas)}
          icon={TrendingDown}
          iconClassName="bg-red-500/15 text-red-400"
          footnote={`↓ ${mockSummary.despesasVariacaoPercentual}% vs mês anterior`}
          footnoteClassName="text-red-400"
        />
        <SummaryCard
          label="Economia"
          value={formatCurrency(mockSummary.economia)}
          icon={Clock}
          iconClassName="bg-sky-500/15 text-sky-400"
          footnote={`${mockSummary.economiaPercentualDaReceita}% da receita`}
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
            iconClassName="bg-emerald-500/15 text-emerald-400"
          />
          <QuickActionButton
            label="Adicionar Despesa"
            icon={Minus}
            iconClassName="bg-red-500/15 text-red-400"
          />
          <QuickActionButton
            label="Criar Meta"
            icon={Settings}
            iconClassName="bg-sky-500/15 text-sky-400"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <FinanceChart data={mockChartData} year={2025} />
        <TransactionList transactions={mockTransactions} />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Metas Financeiras</h2>
            <p className="mt-0.5 text-xs text-slate-400">{mockGoals.length} metas em andamento</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            + Nova meta
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
