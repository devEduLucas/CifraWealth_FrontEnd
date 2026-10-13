import type {
  AuthResponse,
  CategoryInput,
  CategoryResponse,
  DashboardResponse,
  GoalInput,
  GoalResponse,
  MonthlyReportItem,
  TransactionInput,
  TransactionResponse,
  UserResponse,
} from './api';
import type { DetailedReportResponse } from '../types/reports.types';

const STORAGE_KEY = 'cifrawealth:mock_store:v1';

interface MockStoreData {
  user: UserResponse;
  categories: CategoryResponse[];
  transactions: TransactionResponse[];
  goals: GoalResponse[];
}

function getInitialData(): MockStoreData {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const pad = (n: number) => String(n).padStart(2, '0');

  const initialCategories: CategoryResponse[] = [
    { id_categoria: 1, nome: 'Salário', tipo: 'receita', icone: 'DollarSign', cor: '#10b981' },
    { id_categoria: 2, nome: 'Investimentos', tipo: 'receita', icone: 'TrendingUp', cor: '#06b6d4' },
    { id_categoria: 3, nome: 'Freelance', tipo: 'receita', icone: 'Briefcase', cor: '#8b5cf6' },
    { id_categoria: 4, nome: 'Alimentação', tipo: 'despesa', icone: 'Coffee', cor: '#f97316' },
    { id_categoria: 5, nome: 'Moradia', tipo: 'despesa', icone: 'Home', cor: '#ef4444' },
    { id_categoria: 6, nome: 'Transporte', tipo: 'despesa', icone: 'Car', cor: '#eab308' },
    { id_categoria: 7, nome: 'Lazer', tipo: 'despesa', icone: 'Smile', cor: '#ec4899' },
    { id_categoria: 8, nome: 'Saúde', tipo: 'despesa', icone: 'HeartPulse', cor: '#14b8a6' },
  ];

  const initialGoals: GoalResponse[] = [
    {
      id_meta: 1,
      titulo: 'Reserva de Emergência',
      descricao: '6 meses de despesas essenciais guardados',
      valor_objetivo: 15000,
      valor_atual: 10500,
      status: 'em_andamento',
      data_inicio: `${currentYear}-01-01`,
      data_fim: `${currentYear}-12-31`,
    },
    {
      id_meta: 2,
      titulo: 'Viagem de Férias',
      descricao: 'Viagem para a praia com a família',
      valor_objetivo: 6000,
      valor_atual: 3600,
      status: 'em_andamento',
      data_inicio: `${currentYear}-03-01`,
      data_fim: `${currentYear}-11-30`,
    },
    {
      id_meta: 3,
      titulo: 'Notebook Novo',
      descricao: 'Atualização para equipamento de trabalho',
      valor_objetivo: 4500,
      valor_atual: 4500,
      status: 'concluida',
      data_inicio: `${currentYear}-01-15`,
      data_fim: `${currentYear}-06-30`,
    },
  ];

  // Seed transactions across recent months of current year
  const initialTransactions: TransactionResponse[] = [];
  let txId = 1;

  for (let m = 1; m <= currentMonth; m++) {
    const monthStr = `${currentYear}-${pad(m)}`;
    // Salary
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 1,
      valor: 6500,
      tipo: 'receita',
      descricao: 'Salário Mensal',
      data_transacao: `${monthStr}-05`,
      status: 'confirmada',
    });

    // Rent / Housing
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 5,
      valor: 1800,
      tipo: 'despesa',
      descricao: 'Aluguel e Condomínio',
      data_transacao: `${monthStr}-10`,
      status: 'confirmada',
    });

    // Groceries
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 4,
      valor: 850 + (m % 3) * 50,
      tipo: 'despesa',
      descricao: 'Supermercado Mensal',
      data_transacao: `${monthStr}-12`,
      status: 'confirmada',
    });

    // Transport
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 6,
      valor: 320,
      tipo: 'despesa',
      descricao: 'Combustível e Transporte',
      data_transacao: `${monthStr}-15`,
      status: 'confirmada',
    });

    // Leisure
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 7,
      valor: 280,
      tipo: 'despesa',
      descricao: 'Restaurantes e Passeios',
      data_transacao: `${monthStr}-20`,
      status: 'confirmada',
    });

    // Investments / Freelance alternating
    if (m % 2 === 0) {
      initialTransactions.push({
        id_transacao: txId++,
        id_categoria: 3,
        valor: 1200,
        tipo: 'receita',
        descricao: 'Projeto Freelance',
        data_transacao: `${monthStr}-22`,
        status: 'confirmada',
      });
    } else {
      initialTransactions.push({
        id_transacao: txId++,
        id_categoria: 2,
        valor: 350,
        tipo: 'receita',
        descricao: 'Dividendos de Ações',
        data_transacao: `${monthStr}-18`,
        status: 'confirmada',
      });
    }

    // Health
    initialTransactions.push({
      id_transacao: txId++,
      id_categoria: 8,
      valor: 240,
      tipo: 'despesa',
      descricao: 'Farmácia e Plano de Saúde',
      data_transacao: `${monthStr}-25`,
      status: 'confirmada',
    });
  }

  return {
    user: {
      id_usuario: 1,
      nome: 'Lucas',
      sobrenome: 'Silva',
      email: 'usuario@cifrawealth.com',
    },
    categories: initialCategories,
    transactions: initialTransactions,
    goals: initialGoals,
  };
}

class MockStore {
  private data: MockStoreData;

  constructor() {
    this.data = this.load();
  }

  private load(): MockStoreData {
    if (typeof window === 'undefined') return getInitialData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data: MockStoreData) {
    this.data = data;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }

  login(email: string): AuthResponse {
    const parts = email.split('@')[0].split('.');
    const nome = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Usuário';
    const sobrenome = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Silva';

    const user: UserResponse = {
      id_usuario: 1,
      nome,
      sobrenome,
      email,
    };
    this.data.user = user;
    this.save(this.data);

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
    };
  }

  googleLogin(): AuthResponse {
    return this.login('usuario.google@cifrawealth.com');
  }

  register(fullName: string, email: string): { email: string; message: string } {
    const names = fullName.trim().split(' ');
    const nome = names[0] || 'Usuário';
    const sobrenome = names.slice(1).join(' ') || null;

    this.data.user = {
      id_usuario: 1,
      nome,
      sobrenome,
      email,
    };
    this.save(this.data);

    return {
      email,
      message: 'Cadastro realizado com sucesso! Você já pode entrar na sua conta.',
    };
  }

  getDashboard(): DashboardResponse {
    let total_receitas = 0;
    let total_despesas = 0;
    const catMap = new Map<number, { nome: string; tipo: 'receita' | 'despesa'; total: number }>();

    for (const c of this.data.categories) {
      catMap.set(c.id_categoria, { nome: c.nome, tipo: c.tipo, total: 0 });
    }

    for (const t of this.data.transactions) {
      if (t.status === 'pendente') continue;
      if (t.tipo === 'receita') {
        total_receitas += t.valor;
      } else {
        total_despesas += t.valor;
      }
      const existing = catMap.get(t.id_categoria);
      if (existing) {
        existing.total += t.valor;
      }
    }

    const por_categoria = Array.from(catMap.entries()).map(([id, item]) => ({
      id_categoria: id,
      nome: item.nome,
      tipo: item.tipo,
      total: item.total,
    }));

    return {
      saldo: total_receitas - total_despesas,
      total_receitas,
      total_despesas,
      por_categoria,
    };
  }

  listCategories(): CategoryResponse[] {
    return [...this.data.categories];
  }

  createCategory(input: CategoryInput): CategoryResponse {
    const nextId = this.data.categories.reduce((max, c) => Math.max(max, c.id_categoria), 0) + 1;
    const category: CategoryResponse = {
      id_categoria: nextId,
      nome: input.nome,
      tipo: input.tipo,
      icone: input.icone ?? null,
      cor: input.cor ?? '#10b981',
    };
    this.data.categories.push(category);
    this.save(this.data);
    return category;
  }

  updateCategory(id: number, input: Partial<CategoryInput>): CategoryResponse {
    const index = this.data.categories.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      throw new Error('Categoria não encontrada.');
    }
    const updated = {
      ...this.data.categories[index],
      ...input,
    };
    this.data.categories[index] = updated;
    this.save(this.data);
    return updated;
  }

  deleteCategory(id: number): void {
    this.data.categories = this.data.categories.filter((c) => c.id_categoria !== id);
    this.save(this.data);
  }

  listTransactions(filters?: {
    tipo?: 'receita' | 'despesa';
    id_categoria?: number;
    data_inicio?: string;
    data_fim?: string;
    status?: 'confirmada' | 'pendente';
    limit?: number;
    page?: number;
  }): TransactionResponse[] {
    const list = this.data.transactions.filter((t) => {
      if (filters?.tipo && t.tipo !== filters.tipo) return false;
      if (filters?.id_categoria && t.id_categoria !== filters.id_categoria) return false;
      if (filters?.data_inicio && t.data_transacao < filters.data_inicio) return false;
      if (filters?.data_fim && t.data_transacao > filters.data_fim) return false;
      if (filters?.status && t.status !== filters.status) return false;
      return true;
    });

    if (filters?.limit) {
      const page = filters.page ?? 1;
      const skip = (page - 1) * filters.limit;
      return list.slice(skip, skip + filters.limit);
    }

    return list;
  }

  createTransaction(input: TransactionInput): TransactionResponse {
    const nextId = this.data.transactions.reduce((max, t) => Math.max(max, t.id_transacao), 0) + 1;
    const transaction: TransactionResponse = {
      id_transacao: nextId,
      id_categoria: input.id_categoria,
      valor: input.valor,
      tipo: input.tipo,
      descricao: input.descricao,
      data_transacao: input.data_transacao,
      status: input.status ?? 'confirmada',
    };
    this.data.transactions.unshift(transaction);
    this.save(this.data);
    return transaction;
  }

  updateTransaction(id: number, input: Partial<TransactionInput>): TransactionResponse {
    const index = this.data.transactions.findIndex((t) => t.id_transacao === id);
    if (index === -1) {
      throw new Error('Transação não encontrada.');
    }
    const updated = {
      ...this.data.transactions[index],
      ...input,
    };
    this.data.transactions[index] = updated;
    this.save(this.data);
    return updated;
  }

  deleteTransaction(id: number): void {
    this.data.transactions = this.data.transactions.filter((t) => t.id_transacao !== id);
    this.save(this.data);
  }

  getMonthlyReport(year: number): MonthlyReportItem[] {
    const pad = (n: number) => String(n).padStart(2, '0');
    const result: MonthlyReportItem[] = [];

    for (let m = 1; m <= 12; m++) {
      const monthPrefix = `${year}-${pad(m)}`;
      let receitas = 0;
      let despesas = 0;

      for (const t of this.data.transactions) {
        if (t.data_transacao.startsWith(monthPrefix) && t.status !== 'pendente') {
          if (t.tipo === 'receita') {
            receitas += t.valor;
          } else {
            despesas += t.valor;
          }
        }
      }

      result.push({
        mes: monthPrefix,
        total_receitas: receitas,
        total_despesas: despesas,
        saldo: receitas - despesas,
      });
    }

    return result;
  }

  getDetailedReport(start: string, end: string): DetailedReportResponse {
    const catMap = new Map(this.data.categories.map((c) => [c.id_categoria, c]));

    const filtered = this.data.transactions.filter(
      (t) => t.data_transacao >= start && t.data_transacao <= end && t.status !== 'pendente'
    );

    let totalReceitas = 0;
    let totalDespesas = 0;
    const catTotals = new Map<number, number>();

    const txReport = filtered.map((t) => {
      const cat = catMap.get(t.id_categoria);
      if (t.tipo === 'receita') totalReceitas += t.valor;
      else {
        totalDespesas += t.valor;
        catTotals.set(t.id_categoria, (catTotals.get(t.id_categoria) || 0) + t.valor);
      }
      return {
        id: t.id_transacao,
        data: t.data_transacao,
        descricao: t.descricao,
        categoria: cat?.nome ?? 'Sem categoria',
        tipo: t.tipo,
        valor: t.valor,
      };
    });

    const saldo = totalReceitas - totalDespesas;
    const taxaEconomia = totalReceitas > 0 ? Math.max(0, Math.round((saldo / totalReceitas) * 100)) : 0;

    const categoryBreakdown = Array.from(catTotals.entries()).map(([id, total]) => {
      const cat = catMap.get(id);
      const percentual = totalDespesas > 0 ? Math.round((total / totalDespesas) * 100) : 0;
      return {
        id,
        nome: cat?.nome ?? 'Outros',
        percentual,
        total,
        cor: cat?.cor ?? '#94a3b8',
      };
    });

    // Monthly groups
    const monthMap = new Map<string, { receitas: number; despesas: number }>();
    for (const t of filtered) {
      const m = t.data_transacao.slice(0, 7);
      const cur = monthMap.get(m) || { receitas: 0, despesas: 0 };
      if (t.tipo === 'receita') cur.receitas += t.valor;
      else cur.despesas += t.valor;
      monthMap.set(m, cur);
    }

    const sortedMonths = Array.from(monthMap.keys()).sort();
    const evolution = sortedMonths.map((m) => {
      const d = monthMap.get(m)!;
      return {
        mes: m,
        receitas: d.receitas,
        despesas: d.despesas,
        saldo: d.receitas - d.despesas,
      };
    });

    const monthlyComparison = sortedMonths.map((m) => {
      const d = monthMap.get(m)!;
      return {
        mes: m,
        receitas: d.receitas,
        despesas: d.despesas,
      };
    });

    const history = sortedMonths.map((m, idx) => {
      const d = monthMap.get(m)!;
      const curSaldo = d.receitas - d.despesas;
      let varPct: number | null = null;
      if (idx > 0) {
        const prev = monthMap.get(sortedMonths[idx - 1])!;
        const prevSaldo = prev.receitas - prev.despesas;
        if (prevSaldo !== 0) {
          varPct = Math.round(((curSaldo - prevSaldo) / Math.abs(prevSaldo)) * 100);
        }
      }
      return {
        id: m,
        periodo: m,
        receitas: d.receitas,
        despesas: d.despesas,
        saldo: curSaldo,
        variacaoPercentual: varPct,
      };
    });

    const goals = this.data.goals.map((g) => ({
      id: g.id_meta,
      nome: g.titulo,
      valorAtual: g.valor_atual,
      valorAlvo: g.valor_objetivo,
    }));

    const insights = [
      {
        id: '1',
        tipo: (saldo >= 0 ? 'positivo' : 'negativo') as 'positivo' | 'negativo' | 'neutro',
        mensagem:
          saldo >= 0
            ? `Você economizou ${taxaEconomia}% da sua receita total no período analisado.`
            : 'Suas despesas superaram suas receitas neste período. Revise gastos não essenciais.',
      },
      {
        id: '2',
        tipo: 'neutro' as const,
        mensagem: `${categoryBreakdown.length} categorias de despesas foram movimentadas neste intervalo.`,
      },
    ];

    return {
      dataInicio: start,
      dataFim: end,
      summary: {
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo,
        taxaEconomiaPercentual: taxaEconomia,
        variacaoReceitas: null,
        variacaoDespesas: null,
        variacaoSaldo: null,
        variacaoTaxaEconomia: null,
      },
      evolution,
      categoryBreakdown,
      monthlyComparison,
      insights,
      goals,
      history,
      transactions: txReport,
    };
  }

  listGoals(): GoalResponse[] {
    return [...this.data.goals];
  }

  createGoal(input: GoalInput): GoalResponse {
    const nextId = this.data.goals.reduce((max, g) => Math.max(max, g.id_meta), 0) + 1;
    const goal: GoalResponse = {
      id_meta: nextId,
      titulo: input.titulo,
      descricao: input.descricao ?? null,
      valor_objetivo: input.valor_objetivo,
      valor_atual: 0,
      status: 'em_andamento',
      data_inicio: input.data_inicio ?? new Date().toISOString().slice(0, 10),
      data_fim: input.data_fim ?? null,
    };
    this.data.goals.push(goal);
    this.save(this.data);
    return goal;
  }

  updateGoal(id: number, input: Partial<GoalInput>): GoalResponse {
    const index = this.data.goals.findIndex((g) => g.id_meta === id);
    if (index === -1) {
      throw new Error('Meta não encontrada.');
    }
    const updated = {
      ...this.data.goals[index],
      ...input,
    };
    this.data.goals[index] = updated;
    this.save(this.data);
    return updated;
  }

  deleteGoal(id: number): void {
    this.data.goals = this.data.goals.filter((g) => g.id_meta !== id);
    this.save(this.data);
  }

  contributeGoal(id: number, valor: number): GoalResponse {
    const index = this.data.goals.findIndex((g) => g.id_meta === id);
    if (index === -1) {
      throw new Error('Meta não encontrada.');
    }
    const goal = this.data.goals[index];
    const newCurrent = goal.valor_atual + valor;
    const isCompleted = newCurrent >= goal.valor_objetivo;

    const updated: GoalResponse = {
      ...goal,
      valor_atual: newCurrent,
      status: isCompleted ? 'concluida' : goal.status,
    };
    this.data.goals[index] = updated;
    this.save(this.data);
    return updated;
  }
}

export const mockStore = new MockStore();
