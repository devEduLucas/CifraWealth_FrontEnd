import type { ReportHistoryItem } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';

interface ReportsHistoryTableProps {
  items: ReportHistoryItem[];
  onView?: (id: string) => void;
}

export function ReportsHistoryTable({ items, onView }: ReportsHistoryTableProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">Resumo mensal do período</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-subtle">
              <th className="pb-3 font-medium">Período</th>
              <th className="pb-3 font-medium">Receitas</th>
              <th className="pb-3 font-medium">Despesas</th>
              <th className="pb-3 font-medium">Saldo</th>
              <th className="pb-3 font-medium">Variação</th>
              <th className="pb-3 text-right font-medium">Ações</th>
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
                  <td className="py-3.5 text-accent">{formatCurrency(item.receitas)}</td>
                  <td className="py-3.5 text-danger">{formatCurrency(item.despesas)}</td>
                  <td className="py-3.5 text-info">{formatCurrency(item.saldo)}</td>
                  <td className="py-3.5">
                    {item.variacaoPercentual === null ? (
                      <span className="text-subtle">—</span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.variacaoPercentual >= 0 ? 'bg-teal-500/15 text-accent' : 'bg-red-500/15 text-danger'
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
                      className="rounded-lg border border-line-strong bg-elevated px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:border-teal-400/60 hover:text-accent"
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
