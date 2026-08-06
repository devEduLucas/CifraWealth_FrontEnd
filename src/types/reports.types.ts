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
