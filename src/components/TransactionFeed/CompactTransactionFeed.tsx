import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { transactionDayLabel, transactionStatus } from '../../utils/transactions';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import type { TransactionFeedProps } from './TransactionFeed.types';

const STATUS_LABEL = { prevista: 'Prevista', pendente: 'Pendente', confirmada: 'Confirmada' };

export function CompactTransactionFeed({ transactions, categories, today, valuesVisible, error, busyId, onEdit, onDelete, onConfirm }: TransactionFeedProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = transactions.find((item) => item.id_transacao === selectedId);
  const names = new Map(categories.map((category) => [category.id_categoria, category.nome]));
  const days = new Map<string, typeof transactions>();
  for (const item of transactions) days.set(item.data_transacao, [...(days.get(item.data_transacao) ?? []), item]);
  const amount = (value: number, income: boolean) => valuesVisible ? `${income ? '+' : '−'}${formatCurrency(value)}` : 'R$ ••••••';

  return <>
    <div className="space-y-5" data-testid="compact-transaction-feed">
      {[...days].map(([date, items]) => <section key={date} aria-label={transactionDayLabel(date, today)}>
        <h3 className="mb-2 text-xs font-semibold text-muted"><time dateTime={date}>{transactionDayLabel(date, today)}</time></h3>
        <div className="rounded-xl border border-line bg-surface">
          <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6.5rem_9rem_1rem] gap-3 border-b border-line px-4 py-2 text-xs font-medium text-muted lg:grid"><span>Descrição</span><span>Categoria</span><span>Situação</span><span className="text-right">Valor</span><span /></div>
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const income = item.tipo === 'receita';
              const status = transactionStatus(item, today);
              return <li key={item.id_transacao} className={'transaction-entry min-w-0 border-l-[3px] first:rounded-tl-xl last:rounded-bl-xl ' + (income ? 'border-l-positive bg-positive/[0.07]' : 'border-l-danger bg-danger/[0.07]')}>
                <button type="button" onClick={() => setSelectedId(item.id_transacao)} aria-label={`Ver detalhes de ${item.descricao}`} className="grid min-h-14 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2 text-left transition-colors hover:bg-hover sm:px-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6.5rem_9rem_1rem] lg:gap-3">
                  <span className="min-w-0"><span className="flex items-center gap-2"><span aria-hidden="true" className={income ? 'text-positive' : 'text-danger'}>{income ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><span className="truncate text-sm font-semibold text-foreground">{item.descricao}</span></span><span className="mt-0.5 flex min-w-0 items-center gap-2 pl-[23px] text-xs text-muted lg:hidden"><span className="truncate">{names.get(item.id_categoria) ?? 'Sem categoria'}</span>{status !== 'confirmada' && <span className="shrink-0 font-medium text-warning">{STATUS_LABEL[status]}</span>}</span></span>
                  <span className="hidden truncate text-sm text-muted lg:block">{names.get(item.id_categoria) ?? 'Sem categoria'}</span>
                  <span className={'hidden text-xs font-medium lg:block ' + (status === 'confirmada' ? 'text-muted' : 'text-warning')}>{STATUS_LABEL[status]}</span>
                  <span className={'whitespace-nowrap text-right text-sm font-bold tabular-nums ' + (!valuesVisible ? 'text-muted' : income ? 'text-positive' : 'text-danger')}><span className="sr-only">{income ? 'Receita: ' : 'Despesa: '}</span>{amount(item.valor, income)}</span>
                  <ChevronRight size={15} aria-hidden="true" className="hidden text-subtle lg:block" />
                </button>
              </li>;
            })}
          </ul>
        </div>
      </section>)}
    </div>
    <Modal open={Boolean(selected)} title="Detalhes da transação" saving={busyId !== null} onClose={() => setSelectedId(null)}>
      {selected && <>
        <h3 className="break-words text-lg font-semibold text-foreground">{selected.descricao}</h3>
        <p className={'mt-3 break-words text-3xl font-bold tabular-nums ' + (!valuesVisible ? 'text-muted' : selected.tipo === 'receita' ? 'text-positive' : 'text-danger')}>{amount(selected.valor, selected.tipo === 'receita')}</p>
        <dl className="my-6 divide-y divide-line text-sm">{[
          ['Categoria', names.get(selected.id_categoria) ?? 'Sem categoria'], ['Tipo', selected.tipo === 'receita' ? 'Receita' : 'Despesa'], ['Data', formatDate(selected.data_transacao)], ['Situação', STATUS_LABEL[transactionStatus(selected, today)]],
        ].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="shrink-0 text-muted">{label}</dt><dd className="break-words text-right font-medium text-foreground">{value}</dd></div>)}</dl>
        {transactionStatus(selected, today) !== 'confirmada' && <p className="mb-4 text-sm text-muted">{transactionStatus(selected, today) === 'prevista' ? 'Entra no saldo após a data e a confirmação.' : 'Ainda não faz parte do saldo confirmado.'}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {selected.status === 'pendente' && transactionStatus(selected, today) !== 'prevista' && <Button icon={Check} disabled={busyId !== null} onClick={() => onConfirm(selected)}>{busyId === selected.id_transacao ? 'Confirmando...' : 'Confirmar'}</Button>}
          <Button variant="secondary" icon={Pencil} disabled={busyId !== null} onClick={() => { setSelectedId(null); onEdit(selected); }}>Editar transação</Button>
          <button type="button" disabled={busyId !== null} onClick={() => { setSelectedId(null); onDelete(selected); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-40"><Trash2 size={17} aria-hidden="true" />Excluir transação</button>
        </div>
      </>}
    </Modal>
  </>;
}
