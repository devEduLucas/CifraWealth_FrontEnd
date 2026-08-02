import type { ChartPoint, GoalItem, TransactionItem } from '../types/dashboard.types';

export const mockBalance = {
  total: 12480.35,
  variacaoPercentual: 8.5,
};

export const mockSummary = {
  receitas: 8900,
  despesas: 3200,
  despesasVariacaoPercentual: -5,
  economia: 5700,
  economiaPercentualDaReceita: 64,
};

export const mockChartData: ChartPoint[] = [
  { month: 'Mar', receitas: 6200, despesas: 3100 },
  { month: 'Abr', receitas: 7100, despesas: 3400 },
  { month: 'Mai', receitas: 6800, despesas: 3600 },
  { month: 'Jun', receitas: 7900, despesas: 3300 },
  { month: 'Jul', receitas: 8300, despesas: 3050 },
  { month: 'Ago', receitas: 8900, despesas: 3200 },
];

export const mockTransactions: TransactionItem[] = [
  {
    id: 't1',
    descricao: 'Mercado',
    categoriaLabel: 'Supermercado',
    categoria: 'mercado',
    valor: 180,
    tipo: 'despesa',
    data: 'Ontem',
  },
  {
    id: 't2',
    descricao: 'Salário',
    categoriaLabel: 'Empresa',
    categoria: 'salario',
    valor: 5000,
    tipo: 'receita',
    data: '01/08',
  },
  {
    id: 't3',
    descricao: 'iFood',
    categoriaLabel: 'Alimentação',
    categoria: 'ifood',
    valor: 64.9,
    tipo: 'despesa',
    data: '31/07',
  },
  {
    id: 't4',
    descricao: 'Energia Elétrica',
    categoriaLabel: 'Contas',
    categoria: 'energia',
    valor: 189.5,
    tipo: 'despesa',
    data: '30/07',
  },
  {
    id: 't5',
    descricao: 'Freelance App',
    categoriaLabel: 'Renda Extra',
    categoria: 'freelance',
    valor: 1200,
    tipo: 'receita',
    data: '29/07',
  },
  {
    id: 't6',
    descricao: 'Academia',
    categoriaLabel: 'Saúde',
    categoria: 'academia',
    valor: 99.9,
    tipo: 'despesa',
    data: '28/07',
  },
];

export const mockGoals: GoalItem[] = [
  { id: 'g1', nome: 'Notebook', icone: 'notebook', valorAtual: 3200, valorAlvo: 7000 },
  { id: 'g2', nome: 'Viagem Europa', icone: 'viagem', valorAtual: 8500, valorAlvo: 15000 },
  { id: 'g3', nome: 'Reserva de Emergência', icone: 'reserva', valorAtual: 12000, valorAlvo: 20000 },
];
