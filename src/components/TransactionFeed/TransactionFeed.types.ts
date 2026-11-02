import type { CategoryResponse, TransactionResponse } from '../../lib/api';

export interface TransactionFeedProps {
  transactions: TransactionResponse[];
  categories: CategoryResponse[];
  today: string;
  valuesVisible: boolean;
  compact?: boolean;
  error?: string | null;
  busyId: number | null;
  onEdit: (item: TransactionResponse) => void;
  onDelete: (item: TransactionResponse) => void;
  onConfirm: (item: TransactionResponse) => void;
}
