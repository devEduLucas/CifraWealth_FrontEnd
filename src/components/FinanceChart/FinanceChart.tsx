import { useId, useRef, useState, type MouseEvent } from 'react';
import type { ChartPoint } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/validation';
import { useChartWidth } from '../../hooks/useChartWidth';

interface FinanceChartProps {
  data: ChartPoint[];
  year: number | string;
  subtitle: string;
}

const HEIGHT = 240;
const PADDING_X = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  // Straight segments preserve the reported values without inventing extrema.
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`).join(' ');
}

export function FinanceChart({ data, year, subtitle }: FinanceChartProps) {
  const { ref, width: WIDTH } = useChartWidth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dataDescriptionId = useId();

  const allValues = data.flatMap((point) => [point.receitas, point.despesas]);
  const hasData = data.length > 0 && allValues.some((value) => value > 0);
  const maxValue = Math.max(...allValues, 1) * 1.15;
  const minValue = 0;

  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function xFor(index: number): number {
    if (data.length <= 1) return WIDTH / 2;
    return PADDING_X + (index / (data.length - 1)) * usableWidth;
  }

  function yFor(value: number): number {
    return PADDING_TOP + usableHeight - ((value - minValue) / (maxValue - minValue)) * usableHeight;
  }

  const receitasPoints = data.map((point, index) => ({ x: xFor(index), y: yFor(point.receitas) }));
  const despesasPoints = data.map((point, index) => ({ x: xFor(index), y: yFor(point.despesas) }));

  const receitasLine = buildPath(receitasPoints);
  const despesasLine = buildPath(despesasPoints);
  const receitasArea = receitasLine
    ? `${receitasLine} L ${receitasPoints[receitasPoints.length - 1].x},${HEIGHT - PADDING_BOTTOM} L ${receitasPoints[0].x},${HEIGHT - PADDING_BOTTOM} Z`
    : '';

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (data.length - 1));
    setActiveIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  const active = activeIndex !== null ? data[activeIndex] : null;
  const activeX = activeIndex !== null ? xFor(activeIndex) : null;

  return (
    <div ref={ref} className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Receitas x Despesas</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <span className="rounded-lg border border-line-strong bg-elevated px-3 py-1 text-xs font-medium text-secondary">
          {year}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 h-56"
        onMouseMove={hasData ? handleMouseMove : undefined}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <p className="text-sm text-subtle">Sem movimentações neste período.</p>
          </div>
        )}
        <svg
          role="img"
          aria-label="Evolução de receitas e despesas"
          aria-describedby={dataDescriptionId}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="receitasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-income)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--chart-income)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {hasData && <>
            <path d={receitasArea} fill="url(#receitasGradient)" stroke="none" />
            <path d={receitasLine} fill="none" stroke="var(--chart-income)" strokeWidth="2.5" strokeLinecap="round" />
            <path d={despesasLine} fill="none" stroke="var(--chart-expense)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
            {data.length === 1 && <>
              <circle cx={receitasPoints[0].x} cy={receitasPoints[0].y} r="4" fill="var(--chart-income)" />
              <circle cx={despesasPoints[0].x} cy={despesasPoints[0].y} r="4" fill="var(--chart-expense)" />
            </>}
          </>}

          {activeX !== null && (
            <line
              x1={activeX}
              y1={PADDING_TOP}
              x2={activeX}
              y2={HEIGHT - PADDING_BOTTOM}
              stroke="var(--chart-grid)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {data.map((point, index) => (
            <text
              key={point.month}
              x={xFor(index)}
              y={HEIGHT - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--chart-label)"
            >
              {point.month}
            </text>
          ))}
        </svg>

        {hasData && active && activeIndex !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 -translate-x-1/2 rounded-xl border border-line-strong bg-elevated p-3 text-xs shadow-lg shadow-black/40"
            style={{
              left: `${(xFor(activeIndex) / WIDTH) * 100}%`,
              transform:
                activeIndex > data.length - 2 ? 'translateX(-90%)' : activeIndex === 0 ? 'translateX(-10%)' : 'translateX(-50%)',
            }}
          >
            <p className="font-semibold text-foreground">{active.month}</p>
            <p className="mt-1.5 flex items-center justify-between gap-3 text-positive">
              <span>Receitas</span>
              <span className="font-semibold">{formatCurrency(active.receitas)}</span>
            </p>
            <p className="mt-1 flex items-center justify-between gap-3 text-danger">
              <span>Despesas</span>
              <span className="font-semibold">{formatCurrency(active.despesas)}</span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-danger" />
          Despesas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-positive" />
          Receitas
        </span>
      </div>

      <p id={dataDescriptionId} className="sr-only">
        Os mesmos valores mensais estão disponíveis na opção Ver dados do gráfico, logo abaixo.
      </p>
      <details className="mt-5 rounded-xl border border-line">
        <summary className="min-h-11 cursor-pointer rounded-xl px-3 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-elevated">
          Ver dados do gráfico
        </summary>
        {data.length ? (
          <div
            role="region"
            aria-label="Valores mensais do gráfico"
            tabIndex={0}
            className="overflow-x-auto rounded-b-xl border-t border-line px-3 pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <table className="w-full text-left text-xs sm:text-sm">
              <caption className="sr-only">Receitas e despesas por mês — {subtitle}</caption>
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-3 pr-2 font-medium">Mês</th>
                  <th scope="col" className="px-2 py-3 text-right font-medium">Receitas</th>
                  <th scope="col" className="py-3 pl-2 text-right font-medium">Despesas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-foreground">
                {data.map((point) => (
                  <tr key={point.month}>
                    <th scope="row" className="py-3 pr-2 font-medium">{point.month}</th>
                    <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">{formatCurrency(point.receitas)}</td>
                    <td className="whitespace-nowrap py-3 pl-2 text-right tabular-nums">{formatCurrency(point.despesas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border-t border-line px-3 py-3 text-sm text-muted">Nenhum mês disponível neste período.</p>
        )}
      </details>
    </div>
  );
}
