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

<<<<<<< HEAD
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
=======
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
>>>>>>> 94ba038d6f9275755fb8722d3a2f850b01cd5691
  valorAtual: number;
  valorAlvo: number;
}
