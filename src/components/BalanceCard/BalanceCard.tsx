import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/validation';

interface BalanceCardProps {
  total: number;
  variacaoPercentual?: number;
}

export function BalanceCard({ total, variacaoPercentual }: BalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const amountLabel = visible ? formatCurrency(total) : 'R$ ••••••';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted">Saldo dos lançamentos</p>
        <button
          type="button"
          aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
          onClick={() => setVisible((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-secondary"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <p style={{ fontSize: `clamp(0.875rem, calc((100vw - 6rem) / ${amountLabel.length * 0.65}), 2.25rem)` }} className={`mt-2 whitespace-nowrap font-bold tabular-nums tracking-tight ${total < 0 ? 'text-danger' : 'text-foreground'}`}>
        {amountLabel}
      </p>

      {variacaoPercentual !== undefined && (
        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${variacaoPercentual >= 0 ? 'bg-positive/10 text-positive' : 'bg-danger/15 text-danger'}`}>
          {variacaoPercentual >= 0 ? '↑' : '↓'} {variacaoPercentual >= 0 ? '+' : ''}
          {variacaoPercentual.toString().replace('.', ',')}%
          <span className="font-normal">em relação ao mês anterior</span>
        </span>
      )}

      <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted">Receitas menos despesas confirmadas até hoje, a partir dos registros feitos aqui. Não consulta seu banco nem desconta reservas das metas.</p>
    </div>
  );
}
