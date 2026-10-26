import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCheck,
  Clock3,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react';
import type { CategoryResponse, TransactionResponse } from '../../lib/api';
import { formatCurrency } from '../../utils/format';
import {
  transactionDayLabel,
  transactionStatus,
} from '../../utils/transactions';
import { Button } from '../Button/Button';

export function TransactionFeed({
  transactions,
  categories,
  today,
  valuesVisible,
  compact = true,
  busyId,
  onEdit,
  onDelete,
  onConfirm,
}: {
  transactions: TransactionResponse[];
  categories: CategoryResponse[];
  today: string;
  valuesVisible: boolean;
  compact?: boolean;
  busyId: number | null;
  onEdit: (item: TransactionResponse) => void;
  onDelete: (item: TransactionResponse) => void;
  onConfirm: (item: TransactionResponse) => void;
}) {
  const names = new Map(
    categories.map((category) => [category.id_categoria, category.nome]),
  );
  const days = new Map<string, TransactionResponse[]>();
  for (const item of transactions) {
    const group = days.get(item.data_transacao) ?? [];
    group.push(item);
    days.set(item.data_transacao, group);
  }

  return (
    <div className="space-y-6">
      {[...days].map(([date, items]) => (
        <section key={date} aria-label={transactionDayLabel(date, today)}>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="min-w-0 text-xs font-semibold leading-5 text-muted">
              <time dateTime={date}>{transactionDayLabel(date, today)}</time>
            </h3>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>
          <ul className="space-y-2.5">
            {items.map((item) => {
              const income = item.tipo === 'receita';
              const status = transactionStatus(item, today);
              const StatusIcon =
                status === 'prevista'
                  ? CalendarClock
                  : status === 'pendente'
                    ? Clock3
                    : CheckCheck;
              const TypeIcon = income ? ArrowDownLeft : ArrowUpRight;
              return (
                <li
                  key={item.id_transacao}
                  className={`transaction-entry min-w-0 rounded-2xl border border-l-4 ${compact ? 'px-3 py-2.5 sm:px-4' : 'p-4 sm:px-5'} ${income ? 'border-positive/20 border-l-positive bg-positive/5' : 'border-danger/20 border-l-danger bg-danger/5'}`}
                >
                  <div className={`grid min-w-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${compact ? 'gap-1' : 'gap-3'}`}>
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 shrink-0 items-center justify-center rounded-xl ${compact ? 'hidden h-8 w-8 sm:flex' : 'flex h-10 w-10'} ${income ? 'bg-positive/15 text-positive' : 'bg-danger/10 text-danger'}`}
                      >
                        <TypeIcon size={21} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={compact ? 'flex flex-wrap items-baseline justify-between gap-x-4' : ''}>
                        <p className="break-words text-sm font-semibold leading-6 text-foreground sm:text-base">
                          {item.descricao}
                        </p>
                        <p
                          aria-label={
                            valuesVisible ? undefined : 'Valor oculto'
                          }
                          className={`break-words font-bold tabular-nums tracking-tight ${compact ? 'text-base sm:text-lg' : 'mt-0.5 text-xl'} ${!valuesVisible ? 'text-muted' : income ? 'text-positive' : 'text-danger'}`}
                        >
                          {valuesVisible
                            ? `${income ? '+' : '−'}${formatCurrency(item.valor)}`
                            : 'R$ ••••••'}
                        </p>
                        </div>
                        <div className={`flex flex-wrap items-center gap-x-3 text-xs leading-5 ${compact ? 'mt-1 gap-y-1' : 'mt-2 gap-y-2'}`}>
                          <span
                            className={`font-semibold ${income ? 'text-positive' : 'text-danger'}`}
                          >
                            {income ? 'Receita' : 'Despesa'}
                          </span>
                          <span className="inline-flex max-w-full min-w-0 items-start gap-1.5 text-muted">
                            <Tag
                              size={13}
                              aria-hidden="true"
                              className="mt-0.5 shrink-0"
                            />
                            <span className="min-w-0 break-words">
                              {names.get(item.id_categoria) ?? 'Sem categoria'}
                            </span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium ${status === 'confirmada' ? 'border-line bg-surface/70 text-muted' : 'border-warning/30 bg-warning/10 text-warning'}`}
                          >
                            <StatusIcon size={13} aria-hidden="true" />
                            {status === 'prevista'
                              ? 'Prevista · data futura'
                              : status === 'pendente'
                                ? 'Pendente'
                                : 'Confirmada'}
                          </span>
                        </div>
                        {!compact && status !== 'confirmada' && (
                          <p className="mt-2 text-xs leading-5 text-muted">
                            {status === 'prevista'
                              ? 'Fora do saldo atual até a data e a confirmação.'
                              : 'Aguardando confirmação · fora do saldo.'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`flex flex-wrap items-center justify-end gap-1 ${compact ? '' : 'border-t border-line/60 pt-2 md:border-0 md:pt-0'}`}>
                      {item.status === 'pendente' && status !== 'prevista' && (
                        <Button
                          variant="secondary"
                          icon={Check}
                          disabled={busyId !== null}
                          onClick={() => onConfirm(item)}
                        >
                          {busyId === item.id_transacao
                            ? 'Confirmando...'
                            : 'Confirmar'}
                        </Button>
                      )}
                      <button
                        type="button"
                        aria-label={'Editar transação ' + item.descricao}
                        title={'Editar ' + item.descricao}
                        disabled={busyId !== null}
                        onClick={() => onEdit(item)}
                        className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 text-accent-ink transition-colors hover:bg-surface disabled:opacity-40"
                      >
                        <Pencil size={17} aria-hidden="true" />
                        <span className="hidden text-xs font-semibold xl:inline">
                          Editar
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={'Excluir transação ' + item.descricao}
                        title={'Excluir ' + item.descricao}
                        disabled={busyId !== null}
                        onClick={() => onDelete(item)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
