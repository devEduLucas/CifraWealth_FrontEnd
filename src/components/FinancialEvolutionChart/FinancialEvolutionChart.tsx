import type { ReportEvolutionPoint } from '../../types/reports.types';
import { niceMax } from '../../utils/validation';

interface FinancialEvolutionChartProps {
  data: ReportEvolutionPoint[];
  periodLabel: string;
}

const WIDTH = 900;
const HEIGHT = 300;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function FinancialEvolutionChart({ data, periodLabel }: FinancialEvolutionChartProps) {
  const hasData = data.length >= 2;

  const allValues = data.flatMap((point) => [point.receitas, point.despesas, point.saldo]);
  const maxValue = niceMax(Math.max(...allValues, 0) * 1.1);

  const usableWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round((maxValue * fraction) / 1000) * 1000);

  function xFor(index: number): number {
    if (data.length <= 1) return PADDING_LEFT;
    return PADDING_LEFT + (index / (data.length - 1)) * usableWidth;
  }

  function yFor(value: number): number {
    return PADDING_TOP + usableHeight - (value / maxValue) * usableHeight;
  }

  const receitasLine = hasData ? buildSmoothPath(data.map((p, i) => ({ x: xFor(i), y: yFor(p.receitas) }))) : '';
  const despesasLine = hasData ? buildSmoothPath(data.map((p, i) => ({ x: xFor(i), y: yFor(p.despesas) }))) : '';
  const saldoLine = hasData ? buildSmoothPath(data.map((p, i) => ({ x: xFor(i), y: yFor(p.saldo) }))) : '';

  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Receitas, Despesas &amp; Saldo</h2>
          <p className="mt-0.5 text-xs text-slate-400">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-400" />
            Receitas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Despesas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-sky-400" />
            Saldo
          </span>
        </div>
      </div>

      <div className="relative mt-5 h-64">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-slate-300">Seus dados aparecerão aqui.</p>
            <p className="text-xs text-slate-500">Comece registrando suas primeiras transações.</p>
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

          {hasData && (
            <>
              <path d={receitasLine} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />
              <path d={despesasLine} fill="none" stroke="#f04452" strokeWidth="2" strokeLinecap="round" />
              <path d={saldoLine} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
            </>
          )}

          {data.map((point, index) => (
            <text key={point.mes} x={xFor(index)} y={HEIGHT - 6} textAnchor="middle" fontSize="11" fill="#64748b">
              {point.mes}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
