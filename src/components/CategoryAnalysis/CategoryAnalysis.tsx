import type { CategoryType } from '../../lib/api';
import { formatCurrency } from '../../utils/format';
import { categoryUsageSummary, type CategoryMetric, type CategoryPeriod, type CategoryUsage } from '../../utils/categoryUsage';
import { CashFlowComparison } from '../CashFlowComparison/CashFlowComparison';
import { CategoryUsageChart } from '../CategoryUsageChart/CategoryUsageChart';

interface Props {
  items: CategoryUsage[];
  type: CategoryType | null;
  metric: CategoryMetric;
  period: CategoryPeriod;
  periodLabel: string;
  valuesVisible: boolean;
  onMetricChange: (metric: CategoryMetric) => void;
}

export function CategoryAnalysis({ items, type, metric, period, periodLabel, valuesVisible, onMetricChange }: Props) {
  const income = categoryUsageSummary(items, 'receita');
  const expense = categoryUsageSummary(items, 'despesa');
  return <section aria-label="Análise das categorias">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold text-foreground">{type ? type === 'receita' ? 'Suas receitas' : 'Suas despesas' : 'Receitas x despesas'}</h2><span className="text-sm text-muted">{periodLabel}</span></div>
    <section aria-label="Resumo das categorias" data-tone={type === 'receita' ? 'income' : type === 'despesa' ? 'expense' : 'balance'} className="finance-tint rounded-2xl p-5 sm:p-6">
      {type ? <div className="flex flex-wrap items-center justify-between gap-4"><dl><dt className="text-sm font-medium text-secondary">Total em {type === 'receita' ? 'receitas' : 'despesas'}</dt><dd className="mt-1 break-words text-3xl font-bold tabular-nums text-foreground">{valuesVisible ? formatCurrency(type === 'receita' ? income.amount : expense.amount) : 'R$ ••••••'}</dd></dl><p className="text-sm text-muted">{type === 'receita' ? income.count : expense.count} lançamentos</p></div> : <CashFlowComparison income={income.amount} expense={expense.amount} valuesVisible={valuesVisible} />}
    </section>
    <div className={!type ? 'grid min-w-0 gap-4 xl:grid-cols-2' : ''}>
      {(!type || type === 'despesa') && <CategoryUsageChart items={items} type="despesa" metric={metric} period={period} valuesVisible={valuesVisible} onMetricChange={onMetricChange} />}
      {(!type || type === 'receita') && <CategoryUsageChart items={items} type="receita" metric={metric} period={period} valuesVisible={valuesVisible} onMetricChange={onMetricChange} />}
    </div>
    <details className="mt-4 text-sm text-muted"><summary className="min-h-11 cursor-pointer content-center font-medium">O que entra nesta análise?</summary><p className="pb-3 leading-6">Transações confirmadas até hoje, no período escolhido. Pendências e datas futuras ficam de fora. Os percentuais de cada ranking consideram todas as categorias daquele tipo.</p></details>
  </section>;
}
