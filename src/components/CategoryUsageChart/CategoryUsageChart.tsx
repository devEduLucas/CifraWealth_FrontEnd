import { useId } from 'react';
import { ArrowUpRight, BarChart3, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryType } from '../../lib/api';
import {
  rankCategoryUsage,
  categoryTransactionsLink,
  type CategoryMetric,
  type CategoryPeriod,
  type CategoryUsage,
} from '../../utils/categoryUsage';
import { categoryColor } from '../../utils/categoryAppearance';
import { formatCurrency } from '../../utils/format';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon';

export function CategoryUsageChart({
  items,
  type,
  metric,
  period,
  valuesVisible,
  onMetricChange,
}: {
  items: CategoryUsage[];
  type: CategoryType;
  metric: CategoryMetric;
  period: CategoryPeriod;
  valuesVisible: boolean;
  onMetricChange: (metric: CategoryMetric) => void;
}) {
  const titleId = useId();
  const ranking = rankCategoryUsage(items, type, metric);
  return (
    <section
      aria-labelledby={titleId}
      className="mt-5 rounded-2xl border border-line bg-surface p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id={titleId}
            className="text-lg font-bold text-foreground"
          >
            {metric === 'count'
              ? type === 'despesa' ? 'Despesas mais frequentes' : 'Receitas mais frequentes'
              : type === 'despesa'
                ? 'Onde você mais gastou'
                : 'De onde vieram suas receitas'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Top 5 {type === 'despesa' ? 'despesas' : 'receitas'}
          </p>
        </div>
        <div
          role="group"
          aria-label="Comparar categorias por"
          className="inline-flex max-w-full gap-1 rounded-xl border border-line bg-elevated p-1"
        >
          {(
            [
              { value: 'amount', label: 'Por valor' },
              { value: 'count', label: 'Por quantidade' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={metric === value}
              onClick={() => onMetricChange(value)}
              className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${metric === value ? 'bg-surface text-accent-ink shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {!valuesVisible ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-8 text-center">
          <EyeOff size={25} aria-hidden="true" className="text-subtle" />
          <p className="text-sm font-semibold text-foreground">
            Valores e gráfico ocultos
          </p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 py-8 text-center">
          <BarChart3 size={28} aria-hidden="true" className="text-subtle" />
          <p className="text-sm font-semibold text-foreground">
            {type === 'despesa'
              ? 'Nenhuma despesa confirmada neste período.'
              : 'Nenhuma receita confirmada neste período.'}
          </p>
          <Link to={'/transactions?new=1&tipo=' + type} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink hover:underline">Registrar {type === 'despesa' ? 'despesa' : 'receita'}</Link>
        </div>
      ) : (
        <div className="mt-5 space-y-2" data-testid="category-ranking">
          {ranking.map((item, index) => (
            <Link
              key={item.category.id_categoria}
              to={categoryTransactionsLink(item.category, period)}
              aria-label={`Ver transações de ${item.category.nome} no período selecionado`}
              className="group flex min-w-0 items-start gap-3 rounded-xl p-2 transition-colors hover:bg-elevated sm:p-3"
            >
              <CategoryIcon
                icon={item.category.icone}
                color={item.category.cor}
                type={item.category.tipo}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="min-w-0 break-words text-sm font-semibold text-foreground">
                    <span className="mr-1 text-xs font-medium text-muted">
                      {index + 1}.
                    </span>
                    {item.category.nome}
                  </p>
                  <p className="max-w-full break-words text-sm font-bold tabular-nums text-foreground">
                    {metric === 'amount'
                      ? formatCurrency(item.amount)
                      : `${item.count} ${item.count === 1 ? 'lançamento' : 'lançamentos'}`}
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="my-2 h-2 overflow-hidden rounded-full bg-hover"
                >
                  <div
                    className="category-usage-bar h-full rounded-full"
                    style={{
                        width: `${item.share}%`,
                      backgroundColor: categoryColor(item.category.cor, type),
                    }}
                  />
                </div>
                <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs leading-5 text-muted">
                  <span>
                    {metric === 'amount'
                      ? `${item.count} ${item.count === 1 ? 'lançamento confirmado' : 'lançamentos confirmados'}`
                      : formatCurrency(item.amount)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {item.share.toLocaleString('pt-BR', {
                      maximumFractionDigits: 1,
                    })}
                    % {metric === 'amount' ? 'do valor' : 'dos lançamentos'}
                    <ArrowUpRight
                      size={13}
                      aria-hidden="true"
                      className="text-accent-ink"
                    />
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
