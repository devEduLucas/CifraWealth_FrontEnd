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

export type TransactionCategory =
  | 'mercado'
  | 'salario'
  | 'ifood'
  | 'energia'
  | 'freelance'
  | 'academia';

export interface TransactionItem {
  id: string;
  descricao: string;
  categoriaLabel: string;
  categoria: TransactionCategory;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
}

export type GoalIcon = 'notebook' | 'viagem' | 'reserva';

export interface GoalItem {
  id: string;
  nome: string;
  icone: GoalIcon;
  valorAtual: number;
  valorAlvo: number;
}
