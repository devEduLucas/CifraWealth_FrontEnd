import { session } from './session';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit, authenticated = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authenticated) {
    const token = session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (authenticated && response.status === 401) {
    session.clear();
    window.location.assign('/login');
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? 'Erro inesperado. Tente novamente.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function authRequest<T>(path: string, options: RequestInit): Promise<T> {
  return request<T>(path, options, true);
}

export interface UserResponse {
  id_usuario: number;
  nome: string;
  sobrenome: string | null;
  email: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface CategoryBreakdownItem {
  id_categoria: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  total: number;
}

export interface DashboardResponse {
  saldo: number;
  total_receitas: number;
  total_despesas: number;
  por_categoria: CategoryBreakdownItem[];
}

export type CategoryType = 'receita' | 'despesa';

export interface CategoryResponse {
  id_categoria: number;
  nome: string;
  tipo: CategoryType;
  icone: string | null;
  cor: string | null;
}

export interface CategoryInput {
  nome: string;
  tipo: CategoryType;
  icone?: string;
  cor?: string;
}

export type TransactionStatus = 'confirmada' | 'pendente';

export interface TransactionResponse {
  id_transacao: number;
  id_categoria: number;
  valor: number;
  tipo: CategoryType;
  descricao: string;
  data_transacao: string;
  status: TransactionStatus;
}

export interface TransactionInput {
  id_categoria: number;
  valor: number;
  tipo: CategoryType;
  descricao: string;
  data_transacao: string;
  status?: TransactionStatus;
}

export interface MonthlyReportItem {
  mes: string;
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}

export type GoalStatus = 'em_andamento' | 'concluida' | 'cancelada';

export interface GoalResponse {
  id_meta: number;
  titulo: string;
  descricao: string | null;
  valor_objetivo: number;
  valor_atual: number;
  status: GoalStatus;
  data_inicio: string | null;
  data_fim: string | null;
}

export interface GoalInput {
  titulo: string;
  descricao?: string;
  valor_objetivo: number;
  data_inicio?: string;
  data_fim?: string;
}

export const api = {
  register(input: { fullName: string; email: string; password: string }): Promise<UserResponse> {
    return request<UserResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  googleLogin(idToken: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  getDashboard(): Promise<DashboardResponse> {
    return authRequest<DashboardResponse>('/dashboard', { method: 'GET' });
  },

  listCategories(): Promise<CategoryResponse[]> {
    return authRequest<CategoryResponse[]>('/categories', { method: 'GET' });
  },

  createCategory(input: CategoryInput): Promise<CategoryResponse> {
    return authRequest<CategoryResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateCategory(id: number, input: Partial<CategoryInput>): Promise<CategoryResponse> {
    return authRequest<CategoryResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  deleteCategory(id: number): Promise<void> {
    return authRequest<void>(`/categories/${id}`, { method: 'DELETE' });
  },

  listTransactions(filters?: {
    tipo?: CategoryType;
    id_categoria?: number;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<TransactionResponse[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.set('tipo', filters.tipo);
    if (filters?.id_categoria) params.set('id_categoria', String(filters.id_categoria));
    if (filters?.data_inicio) params.set('data_inicio', filters.data_inicio);
    if (filters?.data_fim) params.set('data_fim', filters.data_fim);
    const query = params.toString();
    return authRequest<TransactionResponse[]>(`/transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  createTransaction(input: TransactionInput): Promise<TransactionResponse> {
    return authRequest<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateTransaction(id: number, input: Partial<TransactionInput>): Promise<TransactionResponse> {
    return authRequest<TransactionResponse>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  deleteTransaction(id: number): Promise<void> {
    return authRequest<void>(`/transactions/${id}`, { method: 'DELETE' });
  },

  getMonthlyReport(ano: number): Promise<MonthlyReportItem[]> {
    return authRequest<MonthlyReportItem[]>(`/reports/monthly?ano=${ano}`, { method: 'GET' });
  },

  listGoals(): Promise<GoalResponse[]> {
    return authRequest<GoalResponse[]>('/goals', { method: 'GET' });
  },

  createGoal(input: GoalInput): Promise<GoalResponse> {
    return authRequest<GoalResponse>('/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  contributeGoal(id: number, valor: number): Promise<GoalResponse> {
    return authRequest<GoalResponse>(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ valor }),
    });
  },
};