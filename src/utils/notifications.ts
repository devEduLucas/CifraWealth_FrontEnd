import type { GoalResponse, TransactionResponse } from '../lib/api';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  to: string;
  tone: 'warning' | 'danger' | 'info';
}

export function buildNotifications(goals: GoalResponse[], transactions: TransactionResponse[], today: string): AppNotification[] {
  const weekEnd = new Date(today + 'T00:00:00Z');
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const until = weekEnd.toISOString().slice(0, 10);
  const notifications: AppNotification[] = goals
    .filter((goal) => goal.status === 'em_andamento' && goal.data_fim && goal.data_fim <= until && goal.valor_atual < goal.valor_objetivo)
    .sort((a, b) => a.data_fim!.localeCompare(b.data_fim!) || a.id_meta - b.id_meta)
    .map((goal) => ({
      id: 'goal-' + goal.id_meta,
      title: goal.titulo,
      description: goal.data_fim! < today ? 'A data planejada foi ' + goal.data_fim!.split('-').reverse().join('/') + '. Consulte a meta e revise seu plano.' : goal.data_fim === today ? 'A data planejada para esta meta é hoje.' : 'A data planejada é ' + goal.data_fim!.split('-').reverse().join('/'),
      to: '/goals/' + goal.id_meta,
      tone: 'warning',
    }));
  const pending = transactions.filter((transaction) => transaction.status === 'pendente' && transaction.data_transacao <= today).length;
  if (pending > 0) notifications.push({
    id: 'pending-transactions',
    title: pending === 1 ? '1 transação pendente' : pending + ' transações pendentes',
    description: 'Confira os lançamentos que ainda aguardam confirmação.',
    to: '/transactions?situacao=pendente&fim=' + today,
    tone: 'info',
  });
  return notifications;
}
