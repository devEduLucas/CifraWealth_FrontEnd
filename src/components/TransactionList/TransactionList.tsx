import { Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TransactionItem } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/validation';

const FALLBACK_COLOR = '#64748B';

interface TransactionListProps {
  transactions: TransactionItem[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Últimas Transações</h2>
        <Link to="/transactions" className="text-xs font-medium text-teal-400 hover:underline">
          Ver todas →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm text-slate-400">Nenhuma transação registrada ainda.</p>
          <Link to="/transactions" className="text-xs font-medium text-teal-400 hover:underline">
            Adicionar transação
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {transactions.map((transaction) => {
            const color = transaction.cor ?? FALLBACK_COLOR;
            const isReceita = transaction.tipo === 'receita';

            return (
              <li key={transaction.id} className="flex items-center gap-3 rounded-xl px-1 py-2.5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}26`, color }}
                >
                  <Tag size={17} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{transaction.descricao}</p>
                  <p className="text-xs text-slate-400">{transaction.categoriaNome}</p>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-semibold ${isReceita ? 'text-teal-400' : 'text-red-400'}`}>
                    {isReceita ? '+' : '-'}
                    {formatCurrency(transaction.valor)}
                  </p>
                  <p className="text-xs text-slate-500">{transaction.data}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
