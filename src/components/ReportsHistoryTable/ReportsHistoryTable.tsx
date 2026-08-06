import type { ReportHistoryItem } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';

interface ReportsHistoryTableProps {
  items: ReportHistoryItem[];
  onView?: (id: string) => void;
}

export function ReportsHistoryTable({ items, onView }: ReportsHistoryTableProps) {
  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Histórico de Relatórios</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-3 font-medium">Período</th>
              <th className="pb-3 font-medium">Receitas</th>
              <th className="pb-3 font-medium">Despesas</th>
              <th className="pb-3 font-medium">Saldo</th>
              <th className="pb-3 font-medium">Variação</th>
              <th className="pb-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202634]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  Nenhum relatório encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 font-semibold text-white">{item.periodo}</td>
                  <td className="py-3.5 text-teal-400">{formatCurrency(item.receitas)}</td>
                  <td className="py-3.5 text-red-400">{formatCurrency(item.despesas)}</td>
                  <td className="py-3.5 text-sky-400">{formatCurrency(item.saldo)}</td>
                  <td className="py-3.5">
                    {item.variacaoPercentual === null ? (
                      <span className="text-slate-500">—</span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.variacaoPercentual >= 0 ? 'bg-teal-500/15 text-teal-400' : 'bg-red-500/15 text-red-400'
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
                      className="rounded-lg border border-[#262F40] bg-[#161F32] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-teal-400/60 hover:text-teal-400"
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
