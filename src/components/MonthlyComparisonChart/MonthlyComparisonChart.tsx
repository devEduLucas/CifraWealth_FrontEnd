import { useId } from 'react';
import type { MonthlyComparisonPoint } from '../../types/reports.types';
import { formatCurrency, niceMax } from '../../utils/validation';
import { useChartWidth } from '../../hooks/useChartWidth';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonPoint[];
}

const HEIGHT = 260;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const MIN_MONTH_WIDTH = 84;

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  const { ref, width } = useChartWidth();
  const titleId = useId();
  const tableId = useId();
  const plotWidth = Math.max(width, data.length * MIN_MONTH_WIDTH + PADDING_LEFT + PADDING_RIGHT);
  const scrollable = plotWidth > width;
  const hasData = data.length > 0 && data.some((point) => point.receitas > 0 || point.despesas > 0);

  const maxValue = niceMax(Math.max(...data.flatMap((point) => [point.receitas, point.despesas]), 0) * 1.15);
  const usableWidth = plotWidth - PADDING_LEFT - PADDING_RIGHT;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupWidth = data.length > 0 ? usableWidth / data.length : usableWidth;
  const barWidth = Math.min(18, groupWidth / 4);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => maxValue * fraction);

  function yFor(value: number): number {
    return PADDING_TOP + usableHeight - (value / maxValue) * usableHeight;
  }

  return (
    <div ref={ref} className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id={titleId} className="text-base font-semibold text-foreground">Comparativo Mensal</h2>
      <p className="mt-0.5 text-xs text-muted">Receitas e despesas no período selecionado</p>

      {hasData ? <>
      {scrollable && <p className="mt-3 text-xs text-muted">Deslize para ver todos os meses.</p>}
      <div role="region" tabIndex={0} aria-labelledby={titleId} className="mt-5 max-w-full overflow-x-auto rounded-lg">
        <svg
          role="img"
          aria-label="Comparação mensal de receitas e despesas"
          viewBox={`0 0 ${plotWidth} ${HEIGHT}`}
          width={plotWidth}
          height={HEIGHT}
          className="block max-w-none"
        >
          {ticks.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line x1={PADDING_LEFT} y1={y} x2={plotWidth - PADDING_RIGHT} y2={y} stroke="var(--chart-grid)" strokeDasharray="3 4" />
                <text x={PADDING_LEFT - 8} y={y + 3} textAnchor="end" fontSize="11" fill="var(--chart-label)">
                  {tick.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}

          {data.map((point, index) => {
              const groupX = PADDING_LEFT + index * groupWidth + groupWidth / 2;
              const receitasY = yFor(point.receitas);
              const despesasY = yFor(point.despesas);
              return (
                <g key={point.mes}>
                  <rect
                    x={groupX - barWidth - 3}
                    y={receitasY}
                    width={barWidth}
                    height={HEIGHT - PADDING_BOTTOM - receitasY}
                    rx="3"
                    fill="var(--chart-income)"
                  ><title>{point.mes + ' · Receitas: ' + formatCurrency(point.receitas)}</title></rect>
                  <rect
                    x={groupX + 3}
                    y={despesasY}
                    width={barWidth}
                    height={HEIGHT - PADDING_BOTTOM - despesasY}
                    rx="3"
                    fill="var(--chart-expense)"
                  ><title>{point.mes + ' · Despesas: ' + formatCurrency(point.despesas)}</title></rect>
                </g>
              );
            })}

          {data.map((point, index) => (
            <text
              key={point.mes}
              x={PADDING_LEFT + index * groupWidth + groupWidth / 2}
              y={HEIGHT - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--chart-label)"
            >
              {point.mes}
            </text>
          ))}
        </svg>
      </div>
      </> : <p className="flex min-h-56 items-center justify-center px-6 text-center text-sm text-subtle">Sem dados suficientes para comparação mensal.</p>}

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-positive" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-danger" />
          Despesas
        </span>
      </div>
      <details className="mt-4 rounded-xl border border-line px-3 py-2">
        <summary className="min-h-8 cursor-pointer py-1 text-sm font-semibold text-secondary">Ver valores do comparativo mensal</summary>
        <div role="region" tabIndex={0} aria-labelledby={tableId} className="mt-3 max-w-full overflow-x-auto rounded-lg">
          <table className="w-full min-w-[320px] text-left text-xs">
            <caption id={tableId} className="mb-2 text-left text-muted">Receitas e despesas de cada mês do período</caption>
            <thead><tr><th scope="col" className="p-2">Mês</th><th scope="col" className="p-2 text-right">Receitas</th><th scope="col" className="p-2 text-right">Despesas</th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.map((point) => <tr key={point.mes}><th scope="row" className="p-2 font-medium">{point.mes}</th><td className="p-2 text-right tabular-nums">{formatCurrency(point.receitas)}</td><td className="p-2 text-right tabular-nums">{formatCurrency(point.despesas)}</td></tr>)}
              {data.length === 0 && <tr><td colSpan={3} className="p-3 text-center text-muted">Nenhum mês no período.</td></tr>}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
