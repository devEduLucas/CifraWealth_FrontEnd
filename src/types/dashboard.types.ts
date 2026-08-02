export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: 'dashboard' | 'transactions' | 'goals' | 'reports' | 'profile';
}

export interface ChartPoint {
  month: string;
  receitas: number;
  despesas: number;
}

export interface TransactionItem {
  id: number;
  descricao: string;
  categoriaNome: string;
  tipo: 'receita' | 'despesa';
  cor: string | null;
  valor: number;
  data: string;
}

export interface GoalItem {
  id: number;
  nome: string;
  valorAtual: number;
  valorAlvo: number;
}
