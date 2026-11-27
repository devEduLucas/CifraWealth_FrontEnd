import type { TransactionResponse } from '../lib/api';
export interface TransactionPage {
  items: TransactionResponse[];
  total: number;
  page: number;
  pageSize: number;
  hasHistory: boolean;
  summary: { income: number; expense: number; result: number; pending: number; scheduled: number };
  // Compatibility with older deployments and the local demo, whose API returns an array.
  legacyItems?: TransactionResponse[];
}
export interface CategoryUsageStat { id_categoria: number; amount: number; count: number; historyCount: number }
