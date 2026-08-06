import { useState } from 'react';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { ReportPeriodFilter } from '../components/ReportPeriodFilter/ReportPeriodFilter';
import { ReportExportButton } from '../components/ReportExportButton/ReportExportButton';
import { ReportSummaryCards } from '../components/ReportSummaryCards/ReportSummaryCards';
import { FinancialEvolutionChart } from '../components/FinancialEvolutionChart/FinancialEvolutionChart';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart/CategoryBreakdownChart';
import { MonthlyComparisonChart } from '../components/MonthlyComparisonChart/MonthlyComparisonChart';
import { ReportInsightsPanel } from '../components/ReportInsightsPanel/ReportInsightsPanel';
import { ReportGoalsPanel } from '../components/ReportGoalsPanel/ReportGoalsPanel';
import { ReportsHistoryTable } from '../components/ReportsHistoryTable/ReportsHistoryTable';
import type { ReportPeriod } from '../types/reports.types';
import {
  emptyCategoryBreakdown,
  emptyGoalsPerformance,
  emptyMonthlyComparison,
  emptyReportEvolution,
  emptyReportHistory,
  emptyReportInsights,
  emptyReportSummary,
} from '../lib/mockReports';

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  '3m': 'Últimos 3 meses',
  '6m': 'Últimos 6 meses',
  '12m': 'Últimos 12 meses',
  custom: 'Período personalizado',
};

export function ReportsPage() {
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const [period, setPeriod] = useState<ReportPeriod>('6m');

  // TODO: substituir pelos dados reais assim que a API expuser os endpoints
  // de relatório (ex: api.getReportSummary(period), api.getReportHistory()...).
  // Os componentes já recebem tudo via props, então basta trocar a origem aqui.
  const summary = emptyReportSummary;
  const evolution = emptyReportEvolution;
  const categoryBreakdown = emptyCategoryBreakdown;
  const monthlyComparison = emptyMonthlyComparison;
  const insights = emptyReportInsights;
  const goals = emptyGoalsPerformance;
  const history = emptyReportHistory;

  return (
    <DashboardLayout userName={fullName}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe sua evolução financeira através de indicadores e gráficos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ReportPeriodFilter value={period} onChange={setPeriod} />
          <ReportExportButton />
        </div>
      </div>

      <div className="mt-6">
        <ReportSummaryCards summary={summary} />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Evolução Financeira — {PERIOD_LABELS[period]}
        </p>
        <FinancialEvolutionChart data={evolution} periodLabel={PERIOD_LABELS[period]} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryBreakdownChart data={categoryBreakdown} total={summary.despesas} />
        <MonthlyComparisonChart data={monthlyComparison} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportInsightsPanel insights={insights} />
        <ReportGoalsPanel goals={goals} />
      </div>

      <div className="mt-6">
        <ReportsHistoryTable items={history} />
      </div>
    </DashboardLayout>
  );
}
