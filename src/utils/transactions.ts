import type { CategoryResponse, TransactionResponse } from '../lib/api';

export interface TransactionFilters {
  search: string;
  tipo: '' | 'receita' | 'despesa';
  status: '' | 'confirmada' | 'pendente' | 'prevista';
  category: string;
  start: string;
  end: string;
  order: 'newest' | 'oldest';
}

export const EMPTY_TRANSACTION_FILTERS: TransactionFilters = {
  search: '',
  tipo: '',
  status: '',
  category: '',
  start: '',
  end: '',
  order: 'newest',
};

const normalize = (text: string) =>
  text
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function transactionStatus(item: TransactionResponse, today: string) {
  return item.data_transacao > today ? 'prevista' : item.status;
}

export function selectTransactions(
  items: TransactionResponse[],
  categories: CategoryResponse[],
  filters: TransactionFilters,
  today: string,
) {
  const names = new Map(
    categories.map((item) => [item.id_categoria, item.nome]),
  );
  const query = normalize(filters.search.trim());
  const direction = filters.order === 'oldest' ? 1 : -1;
  return items
    .filter(
      (item) =>
        normalize(
          item.descricao + ' ' + (names.get(item.id_categoria) ?? ''),
        ).includes(query) &&
        (!filters.tipo || item.tipo === filters.tipo) &&
        (!filters.status ||
          transactionStatus(item, today) === filters.status) &&
        (!filters.category || item.id_categoria === Number(filters.category)) &&
        (!filters.start || item.data_transacao >= filters.start) &&
        (!filters.end || item.data_transacao <= filters.end),
    )
    .sort(
      (a, b) =>
        direction *
        (a.data_transacao.localeCompare(b.data_transacao) ||
          a.id_transacao - b.id_transacao),
    );
}

export function summarizeTransactions(
  items: TransactionResponse[],
  today: string,
) {
  let income = 0,
    expense = 0,
    pending = 0,
    scheduled = 0;
  for (const item of items) {
    const status = transactionStatus(item, today);
    if (status === 'prevista') scheduled++;
    else if (status === 'pendente') pending++;
    else if (item.tipo === 'receita') income += Math.round(item.valor * 100);
    else expense += Math.round(item.valor * 100);
  }
  return {
    income: income / 100,
    expense: expense / 100,
    result: (income - expense) / 100,
    pending,
    scheduled,
  };
}

export function transactionFilterCount(filters: TransactionFilters) {
  return (
    Number(Boolean(filters.tipo)) +
    Number(Boolean(filters.status)) +
    Number(Boolean(filters.category)) +
    Number(Boolean(filters.start || filters.end)) +
    Number(filters.order !== 'newest')
  );
}

export function validateTransactionDates(
  start: string,
  end: string,
): string | null {
  for (const value of [start, end].filter(Boolean)) {
    const date = new Date(value + 'T12:00:00Z');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      return 'Informe datas válidas.';
  }
  return start && end && start > end
    ? 'A data inicial deve ser anterior ou igual à final.'
    : null;
}

export type TransactionDatePreset = 'month' | '30days' | 'year' | 'all';
export function transactionDateRange(
  preset: TransactionDatePreset,
  today: string,
) {
  if (preset === 'all') return { start: '', end: '' };
  if (preset === 'month')
    return { start: today.slice(0, 7) + '-01', end: today };
  if (preset === 'year')
    return { start: today.slice(0, 4) + '-01-01', end: today };
  const date = new Date(today + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() - 29);
  return { start: date.toISOString().slice(0, 10), end: today };
}

export function transactionDayLabel(date: string, today: string) {
  const yesterday = new Date(today + 'T12:00:00Z');
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const label = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
  return date === today
    ? `Hoje · ${label}`
    : date === yesterday.toISOString().slice(0, 10)
      ? `Ontem · ${label}`
      : label;
}

export function readTransactionFilters(
  params: URLSearchParams,
): TransactionFilters {
  const type = params.get('new') === '1' ? '' : params.get('tipo');
  const status = params.get('situacao');
  const category = params.get('categoria') ?? '';
  const start = params.get('inicio') ?? '';
  const end = params.get('fim') ?? '';
  const invalidDates = validateTransactionDates(start, end);
  return {
    ...EMPTY_TRANSACTION_FILTERS,
    tipo: type === 'receita' || type === 'despesa' ? type : '',
    status:
      status === 'confirmada' || status === 'pendente' || status === 'prevista'
        ? status
        : '',
    category:
      /^\d+$/.test(category) &&
      Number.isSafeInteger(Number(category)) &&
      Number(category) > 0
        ? category
        : '',
    start: invalidDates ? '' : start,
    end: invalidDates ? '' : end,
    order: params.get('ordem') === 'oldest' ? 'oldest' : 'newest',
  };
}

export function writeTransactionFilters(
  params: URLSearchParams,
  filters: TransactionFilters,
) {
  const next = new URLSearchParams(params);
  for (const key of ['categoria', 'situacao', 'inicio', 'fim', 'ordem'])
    next.delete(key);
  if (next.get('new') !== '1') {
    next.delete('tipo');
    if (filters.tipo) next.set('tipo', filters.tipo);
  }
  if (filters.category) next.set('categoria', filters.category);
  if (filters.status) next.set('situacao', filters.status);
  if (filters.start) next.set('inicio', filters.start);
  if (filters.end) next.set('fim', filters.end);
  if (filters.order !== 'newest') next.set('ordem', filters.order);
  return next;
}
