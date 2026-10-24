import { useId } from 'react';
import type { ReportHistoryItem } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';

interface ReportsHistoryTableProps {
  items: ReportHistoryItem[];
  onView?: (id: string) => void;
}

export function ReportsHistoryTable({ items, onView }: ReportsHistoryTableProps) {
  const tableTitleId = useId();
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id={tableTitleId} className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">Resumo mensal do período</h2>

      <div role="region" tabIndex={0} aria-labelledby={tableTitleId} className="overflow-x-auto rounded-md">
        <table aria-labelledby={tableTitleId} className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-subtle">
              <th scope="col" className="pb-3 font-medium">Período</th>
              <th scope="col" className="pb-3 font-medium">Receitas</th>
              <th scope="col" className="pb-3 font-medium">Despesas</th>
              <th scope="col" className="pb-3 font-medium">Saldo</th>
              <th scope="col" className="pb-3 font-medium">Variação</th>
              <th scope="col" className="pb-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-subtle">
                  Nenhum relatório encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 font-semibold text-foreground">{item.periodo}</td>
                  <td className="py-3.5 text-positive">{formatCurrency(item.receitas)}</td>
                  <td className="py-3.5 text-danger">{formatCurrency(item.despesas)}</td>
                  <td className="py-3.5 text-info">{formatCurrency(item.saldo)}</td>
                  <td className="py-3.5">
                    {item.variacaoPercentual === null ? (
                      <span className="text-subtle">—</span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.variacaoPercentual >= 0 ? 'bg-positive/10 text-positive' : 'bg-danger/15 text-danger'
                        }`}
                      >
                        {item.variacaoPercentual >= 0 ? '↑' : '↓'} {Math.abs(item.variacaoPercentual)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onView?.(item.id)}
                      className="rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:border-accent hover:text-accent-ink"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
