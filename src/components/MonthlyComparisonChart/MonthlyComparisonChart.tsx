import type { MonthlyComparisonPoint } from '../../types/reports.types';
import { niceMax } from '../../utils/validation';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonPoint[];
}

const WIDTH = 560;
const HEIGHT = 260;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  const hasData = data.length > 0 && data.some((point) => point.receitas > 0 || point.despesas > 0);

  const maxValue = niceMax(Math.max(...data.flatMap((point) => [point.receitas, point.despesas]), 0) * 1.15);
  const usableWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const groupWidth = data.length > 0 ? usableWidth / data.length : usableWidth;
  const barWidth = Math.min(18, groupWidth / 4);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round((maxValue * fraction) / 1000) * 1000);

  function yFor(value: number): number {
    return PADDING_TOP + usableHeight - (value / maxValue) * usableHeight;
  }

  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Comparativo Mensal</h2>
      <p className="mt-0.5 text-xs text-slate-400">Receitas vs. Despesas — últimos 6 meses</p>

      <div className="relative mt-5 h-56">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <p className="text-sm text-slate-500">Sem dados suficientes para comparação mensal.</p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className={`h-full w-full ${hasData ? '' : 'opacity-20'}`}
        >
          {ticks.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line x1={PADDING_LEFT} y1={y} x2={WIDTH - PADDING_RIGHT} y2={y} stroke="#202634" strokeDasharray="3 4" />
                <text x={PADDING_LEFT - 8} y={y + 3} textAnchor="end" fontSize="11" fill="#64748b">
                  {tick >= 1000 ? `${tick / 1000}k` : tick}
                </text>
              </g>
            );
          })}

          {hasData &&
            data.map((point, index) => {
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
                    fill="#2dd4bf"
                  />
                  <rect
                    x={groupX + 3}
                    y={despesasY}
                    width={barWidth}
                    height={HEIGHT - PADDING_BOTTOM - despesasY}
                    rx="3"
                    fill="#f87171"
                  />
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
              fill="#64748b"
            >
              {point.mes}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Despesas
        </span>
      </div>
    </div>
  );
}
