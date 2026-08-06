import type {
  GoalPerformanceItem,
  MonthlyComparisonPoint,
  ReportCategoryBreakdownItem,
  ReportEvolutionPoint,
  ReportHistoryItem,
  ReportInsight,
  ReportSummary,
} from '../types/reports.types';

// Dados temporários para um usuário recém-cadastrado (sem movimentações).
// Quando a API expuser os endpoints de relatório (ex: api.getReportSummary(),
// api.getReportHistory()...), substituir estas constantes pelo retorno real —
// os componentes já recebem tudo via props e não dependem deste arquivo.

export const emptyReportSummary: ReportSummary = {
  receitas: 0,
  despesas: 0,
  saldo: 0,
  taxaEconomiaPercentual: 0,
  variacaoReceitas: null,
  variacaoDespesas: null,
  variacaoSaldo: null,
  variacaoTaxaEconomia: null,
};

export const emptyReportEvolution: ReportEvolutionPoint[] = [];

export const emptyCategoryBreakdown: ReportCategoryBreakdownItem[] = [];

export const emptyMonthlyComparison: MonthlyComparisonPoint[] = [];

export const emptyReportInsights: ReportInsight[] = [];

export const emptyGoalsPerformance: GoalPerformanceItem[] = [];

export const emptyReportHistory: ReportHistoryItem[] = [];
