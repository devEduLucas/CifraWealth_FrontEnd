import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Props {
  income: number;
  expense: number;
  valuesVisible: boolean;
  showResult?: boolean;
}

export function CashFlowComparison({ income, expense, valuesVisible, showResult = true }: Props) {
  const incomeCents = Math.round(income * 100);
  const expenseCents = Math.round(expense * 100);
  const largest = Math.max(incomeCents, expenseCents, 1);
  const balance = (incomeCents - expenseCents) / 100;
  return <div className="min-w-0">
    <dl className="space-y-5">
      {[
        { label: 'Receitas', value: income, cents: incomeCents, icon: ArrowDownLeft, tone: 'text-positive', fill: 'bg-positive' },
        { label: 'Despesas', value: expense, cents: expenseCents, icon: ArrowUpRight, tone: 'text-danger', fill: 'bg-danger' },
      ].map(({ label, value, cents, icon: Icon, tone, fill }) => <div key={label}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="inline-flex items-center gap-2 text-sm font-medium text-secondary"><Icon size={17} aria-hidden="true" className={tone} />{label}</dt>
          <dd className="break-words text-lg font-bold tabular-nums text-foreground">{valuesVisible ? formatCurrency(value) : 'R$ ••••••'}</dd>
        </div>
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-hover">{valuesVisible && <div className={'h-full rounded-full ' + fill} style={{ width: `${cents / largest * 100}%` }} />}</div>
      </div>)}
    </dl>
    {showResult && <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-4"><p className="text-sm font-medium text-secondary">Resultado do período</p><p className={'break-words text-2xl font-bold tabular-nums ' + (valuesVisible && balance < 0 ? 'text-danger' : 'text-foreground')}>{valuesVisible ? formatCurrency(balance) : 'R$ ••••••'}</p></div>}
  </div>;
}
