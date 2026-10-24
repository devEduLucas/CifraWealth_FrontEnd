import type {
  CategoryResponse,
  CategoryType,
  TransactionResponse,
} from '../lib/api';

export interface CategoryPeriod {
  start: string;
  end: string;
}
export type CategoryMetric = 'amount' | 'count';
export type CategoryOrder = 'name' | CategoryMetric;
export interface CategoryUsage {
  category: CategoryResponse;
  amount: number;
  count: number;
  historyCount: number;
}

export function buildCategoryUsage(
  categories: CategoryResponse[],
  transactions: TransactionResponse[],
  period: CategoryPeriod,
  today: string,
): CategoryUsage[] {
  const usage = new Map(
    categories.map((category) => [
      category.id_categoria,
      { category, cents: 0, count: 0, historyCount: 0 },
    ]),
  );
  for (const transaction of transactions) {
    const row = usage.get(transaction.id_categoria);
    if (!row) continue;
    row.historyCount++;
    if (
      transaction.tipo !== row.category.tipo ||
      transaction.status !== 'confirmada' ||
      transaction.data_transacao > today ||
      (period.start && transaction.data_transacao < period.start) ||
      (period.end && transaction.data_transacao > period.end)
    )
      continue;
    row.cents += Math.round(transaction.valor * 100);
    row.count++;
  }
  return [...usage.values()].map(
    ({ category, cents, count, historyCount }) => ({
      category,
      amount: cents / 100,
      count,
      historyCount,
    }),
  );
}

export function categoryUsageSummary(
  items: CategoryUsage[],
  type: CategoryType,
) {
  const selected = items.filter((item) => item.category.tipo === type);
  return {
    amount:
      selected.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) /
      100,
    count: selected.reduce((sum, item) => sum + item.count, 0),
    used: selected.filter((item) => item.count > 0).length,
    total: selected.length,
  };
}

const normalize = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
export function orderCategoryUsage(
  items: CategoryUsage[],
  type: CategoryType,
  order: CategoryOrder,
  search = '',
) {
  return items
    .filter(
      (item) =>
        item.category.tipo === type &&
        normalize(item.category.nome).includes(normalize(search)),
    )
    .sort(
      (a, b) =>
        (order === 'name' ? 0 : b[order] - a[order]) ||
        a.category.nome.localeCompare(b.category.nome, 'pt-BR') ||
        a.category.id_categoria - b.category.id_categoria,
    );
}

export function rankCategoryUsage(
  items: CategoryUsage[],
  type: CategoryType,
  metric: CategoryMetric,
) {
  const sorted = orderCategoryUsage(items, type, metric).filter(
    (item) => item.count > 0,
  );
  const total = sorted.reduce(
    (sum, item) =>
      sum + (metric === 'amount' ? Math.round(item.amount * 100) : item.count),
    0,
  );
  return sorted
    .slice(0, 5)
    .map((item) => ({
      ...item,
      share:
        total > 0
          ? ((metric === 'amount'
              ? Math.round(item.amount * 100)
              : item.count) /
              total) *
            100
          : 0,
    }));
}

export function categoryTransactionsLink(
  category: CategoryResponse,
  period: CategoryPeriod,
) {
  const params = new URLSearchParams({
    categoria: String(category.id_categoria),
    tipo: category.tipo,
    situacao: 'confirmada',
  });
  if (period.start) params.set('inicio', period.start);
  if (period.end) params.set('fim', period.end);
  return '/transactions?' + params;
}
