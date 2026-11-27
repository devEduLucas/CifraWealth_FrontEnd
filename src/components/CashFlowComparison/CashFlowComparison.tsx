import { useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useChartMotion } from '../../hooks/useChartMotion';

interface Props {
  income: number;
  expense: number;
  valuesVisible: boolean;
  showResult?: boolean;
}

export function CashFlowComparison({ income, expense, valuesVisible, showResult = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const incomeCents = Math.round(income * 100);
  const expenseCents = Math.round(expense * 100);
  const largest = Math.max(incomeCents, expenseCents, 1);
  const balance = (incomeCents - expenseCents) / 100;
  useChartMotion(ref, JSON.stringify([incomeCents, expenseCents]), valuesVisible && (incomeCents > 0 || expenseCents > 0));
  return <div ref={ref} className="min-w-0">
    <div className="space-y-5">
      {[
        { label: 'Receitas', value: income, cents: incomeCents, icon: ArrowDownLeft, tone: 'text-positive', fill: 'bg-positive' },
        { label: 'Despesas', value: expense, cents: expenseCents, icon: ArrowUpRight, tone: 'text-danger', fill: 'bg-danger' },
      ].map(({ label, value, cents, icon: Icon, tone, fill }, index) => <div key={label}>
        <dl className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="inline-flex items-center gap-2 text-sm font-medium text-secondary"><Icon size={17} aria-hidden="true" className={tone} />{label}</dt>
          <dd className="break-words text-lg font-bold tabular-nums text-foreground">{valuesVisible ? formatCurrency(value) : 'R$ ••••••'}</dd>
        </dl>
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-hover">{valuesVisible && <div data-chart-motion="progress" data-motion-index={index} className={'h-full rounded-full ' + fill} style={{ width: `${cents / largest * 100}%` }} />}</div>
      </div>)}
    </div>
    {showResult && <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-4"><p className="text-sm font-medium text-secondary">Resultado do período</p><p className={'break-words text-2xl font-bold tabular-nums ' + (valuesVisible && balance < 0 ? 'text-danger' : 'text-foreground')}>{valuesVisible ? formatCurrency(balance) : 'R$ ••••••'}</p></div>}
  </div>;
}
