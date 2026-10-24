import { session } from './session';
import type { DetailedReportResponse } from '../types/reports.types';
import { API_URL, isDemoMode } from './config';

async function getDemoStore() {
  return (await import('./mockStore')).mockStore;
}

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

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (netErr) {
    if (options.signal?.aborted) throw netErr;
    console.error(`[CifraWealth API Error] Falha de conexão em ${API_URL}${path}:`, netErr);
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está ligado e acessível.', 0);
  }

  if (authenticated && response.status === 401) {
    session.clear();
    window.location.assign('/login');
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? `Erro na requisição (HTTP ${response.status}).`;
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
  foto_perfil?: string | null;
  capa_perfil?: string | null;
  tem_senha?: boolean;
  acesso_google?: boolean;
}

export interface ProfileInput { fullName: string; avatar?: string | null; cover?: string | null; }
export type DeleteAccountInput = { password: string } | { googleIdToken: string; challengeToken: string };

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
  descricao?: string | null;
  valor_objetivo: number;
  valor_atual?: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  status?: GoalStatus;
}

export const api = {
  async getProfile(signal?: AbortSignal): Promise<UserResponse> {
    if (isDemoMode) return (await getDemoStore()).getProfile();
    return authRequest<UserResponse>('/users/me', { method: 'GET', signal });
  },
  async updateProfile(input: ProfileInput): Promise<UserResponse> {
    if (isDemoMode) return (await getDemoStore()).updateProfile(input);
    return authRequest<UserResponse>('/users/me', { method: 'PATCH', body: JSON.stringify(input) });
  },
  async accountDeletionChallenge(): Promise<{ nonce: string; challengeToken: string }> {
    return authRequest('/users/me/deletion-challenge', { method: 'POST', body: '{}' });
  },
  async deleteAccount(input: DeleteAccountInput): Promise<{ message: string }> {
    if (isDemoMode) return (await getDemoStore()).deleteAccount(input);
    return authRequest('/users/me', { method: 'DELETE', body: JSON.stringify(input) });
  },
  async getDetailedReport(start: string, end: string, signal?: AbortSignal): Promise<DetailedReportResponse> {
    if (isDemoMode) return (await getDemoStore()).getDetailedReport(start, end);
    const params = new URLSearchParams({ data_inicio: start, data_fim: end });
    return authRequest<DetailedReportResponse>(`/reports/detailed?${params}`, { method: 'GET', signal });
  },

  async register(input: { fullName: string; email: string; password: string }): Promise<{ email: string; message: string }> {
    if (isDemoMode) return (await getDemoStore()).register(input.fullName, input.email);
    return request<{ email: string; message: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async verifyEmail(token: string, password: string): Promise<{ message: string }> {
    if (isDemoMode) return { message: 'E-mail validado com sucesso!' };
    return request<{ message: string }>('/users/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    if (isDemoMode) return { message: 'Novo e-mail de confirmação enviado.' };
    return request<{ message: string }>('/users/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { message: 'Se o e-mail informado estiver cadastrado em nossa plataforma, você receberá as instruções em instantes.' };
    }
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { message: 'Senha redefinida com sucesso!' };
    }
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },


  async login(input: { email: string; password: string }): Promise<AuthResponse> {
    if (isDemoMode) return (await getDemoStore()).login(input.email);
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    if (isDemoMode) return (await getDemoStore()).googleLogin();
    return request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  async getDashboard(): Promise<DashboardResponse> {
    if (isDemoMode) return (await getDemoStore()).getDashboard();
    return authRequest<DashboardResponse>('/dashboard', { method: 'GET' });
  },

  async listCategories(): Promise<CategoryResponse[]> {
    if (isDemoMode) return (await getDemoStore()).listCategories();
    return authRequest<CategoryResponse[]>('/categories', { method: 'GET' });
  },

  async createCategory(input: CategoryInput): Promise<CategoryResponse> {
    if (isDemoMode) return (await getDemoStore()).createCategory(input);
    return authRequest<CategoryResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateCategory(id: number, input: Partial<CategoryInput>): Promise<CategoryResponse> {
    if (isDemoMode) return (await getDemoStore()).updateCategory(id, input);
    return authRequest<CategoryResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteCategory(id: number): Promise<void> {
    if (isDemoMode) return (await getDemoStore()).deleteCategory(id);
    return authRequest<void>(`/categories/${id}`, { method: 'DELETE' });
  },

  async listTransactions(filters?: {
    tipo?: CategoryType;
    id_categoria?: number;
    data_inicio?: string;
    data_fim?: string;
    status?: TransactionStatus;
    limit?: number;
    page?: number;
  }): Promise<TransactionResponse[]> {
    if (isDemoMode) return (await getDemoStore()).listTransactions(filters);
    const params = new URLSearchParams();
    if (filters?.tipo) params.set('tipo', filters.tipo);
    if (filters?.id_categoria) params.set('id_categoria', String(filters.id_categoria));
    if (filters?.data_inicio) params.set('data_inicio', filters.data_inicio);
    if (filters?.data_fim) params.set('data_fim', filters.data_fim);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.page) params.set('page', String(filters.page));
    const query = params.toString();
    return authRequest<TransactionResponse[]>(`/transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  async createTransaction(input: TransactionInput): Promise<TransactionResponse> {
    if (isDemoMode) return (await getDemoStore()).createTransaction(input);
    return authRequest<TransactionResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateTransaction(id: number, input: Partial<TransactionInput>): Promise<TransactionResponse> {
    if (isDemoMode) return (await getDemoStore()).updateTransaction(id, input);
    return authRequest<TransactionResponse>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteTransaction(id: number): Promise<void> {
    if (isDemoMode) return (await getDemoStore()).deleteTransaction(id);
    return authRequest<void>(`/transactions/${id}`, { method: 'DELETE' });
  },

  async getMonthlyReport(ano: number, end?: string): Promise<MonthlyReportItem[]> {
    if (isDemoMode) return (await getDemoStore()).getMonthlyReport(ano, end);
    const params = new URLSearchParams({ ano: String(ano) });
    if (end) params.set('data_fim', end);
    return authRequest<MonthlyReportItem[]>(`/reports/monthly?${params}`, { method: 'GET' });
  },

  async listGoals(): Promise<GoalResponse[]> {
    if (isDemoMode) return (await getDemoStore()).listGoals();
    return authRequest<GoalResponse[]>('/goals', { method: 'GET' });
  },

  async createGoal(input: GoalInput): Promise<GoalResponse> {
    if (isDemoMode) return (await getDemoStore()).createGoal(input);
    return authRequest<GoalResponse>('/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateGoal(id: number, input: Partial<GoalInput>): Promise<GoalResponse> {
    if (isDemoMode) return (await getDemoStore()).updateGoal(id, input);
    return authRequest<GoalResponse>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteGoal(id: number): Promise<void> {
    if (isDemoMode) return (await getDemoStore()).deleteGoal(id);
    return authRequest<void>(`/goals/${id}`, { method: 'DELETE' });
  },

  async withdrawGoal(id: number, valor: number): Promise<GoalResponse> {
    if (isDemoMode) return (await getDemoStore()).withdrawGoal(id, valor);
    return authRequest<GoalResponse>(`/goals/${id}/withdraw`, { method: 'POST', body: JSON.stringify({ valor }) });
  },

  async contributeGoal(id: number, valor: number): Promise<GoalResponse> {
    if (isDemoMode) return (await getDemoStore()).contributeGoal(id, valor);
    return authRequest<GoalResponse>(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ valor }),
    });
  },
};
