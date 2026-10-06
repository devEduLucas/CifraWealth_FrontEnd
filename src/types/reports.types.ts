export interface ReportSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  taxaEconomiaPercentual: number;
  variacaoReceitas: number | null;
  variacaoDespesas: number | null;
  variacaoSaldo: number | null;
  variacaoTaxaEconomia: number | null;
}

export interface ReportEvolutionPoint {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface ReportCategoryBreakdownItem {
  total: number;
  id: number;
  nome: string;
  percentual: number;
  cor: string;
}

export interface MonthlyComparisonPoint {
  mes: string;
  receitas: number;
  despesas: number;
}

export type ReportInsightType = 'positivo' | 'negativo' | 'neutro';

export interface ReportInsight {
  id: string;
  tipo: ReportInsightType;
  mensagem: string;
}

export interface GoalPerformanceItem {
  id: number;
  nome: string;
  valorAtual: number;
  valorAlvo: number;
}

export interface ReportHistoryItem {
  id: string;
  periodo: string;
  receitas: number;
  despesas: number;
  saldo: number;
  variacaoPercentual: number | null;
}

export type ReportPeriod = '3m' | '6m' | '12m' | 'custom';

export interface DetailedReportResponse {
  dataInicio: string;
  dataFim: string;
  summary: {
    receitas: number; despesas: number; saldo: number; taxaEconomiaPercentual: number;
    variacaoReceitas: number | null; variacaoDespesas: number | null; variacaoSaldo: number | null; variacaoTaxaEconomia: number | null;
  };
  evolution: Array<{ mes: string; receitas: number; despesas: number; saldo: number }>;
  categoryBreakdown: Array<{ id: number; nome: string; percentual: number; total: number; cor: string }>;
  monthlyComparison: Array<{ mes: string; receitas: number; despesas: number }>;
  insights: Array<{ id: string; tipo: "positivo" | "negativo" | "neutro"; mensagem: string }>;
  goals: Array<{ id: number; nome: string; valorAtual: number; valorAlvo: number }>;
  history: Array<{ id: string; periodo: string; receitas: number; despesas: number; saldo: number; variacaoPercentual: number | null }>;
  transactions: Array<{ id: number; data: string; descricao: string; categoria: string; tipo: "receita" | "despesa"; valor: number }>;
}
