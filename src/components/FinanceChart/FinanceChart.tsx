import { useRef, useState, type MouseEvent } from 'react';
import type { ChartPoint } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/validation';

interface FinanceChartProps {
  data: ChartPoint[];
  year: number;
}

const WIDTH = 700;
const HEIGHT = 240;
const PADDING_X = 12;
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

export function FinanceChart({ data, year }: FinanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const allValues = data.flatMap((point) => [point.receitas, point.despesas]);
  const maxValue = Math.max(...allValues) * 1.15;
  const minValue = 0;

  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function xFor(index: number): number {
    return PADDING_X + (index / (data.length - 1)) * usableWidth;
  }

  function yFor(value: number): number {
    return PADDING_TOP + usableHeight - ((value - minValue) / (maxValue - minValue)) * usableHeight;
  }

  const receitasPoints = data.map((point, index) => ({ x: xFor(index), y: yFor(point.receitas) }));
  const despesasPoints = data.map((point, index) => ({ x: xFor(index), y: yFor(point.despesas) }));

  const receitasLine = buildSmoothPath(receitasPoints);
  const despesasLine = buildSmoothPath(despesasPoints);
  const receitasArea = `${receitasLine} L ${receitasPoints[receitasPoints.length - 1].x},${HEIGHT - PADDING_BOTTOM} L ${receitasPoints[0].x},${HEIGHT - PADDING_BOTTOM} Z`;

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
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Receitas x Despesas</h2>
          <p className="mt-0.5 text-xs text-slate-400">Últimos 6 meses</p>
        </div>
        <span className="rounded-lg border border-[#262F40] bg-[#161F32] px-3 py-1 text-xs font-medium text-slate-300">
          {year}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 h-56"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="receitasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d68f" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00d68f" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={receitasArea} fill="url(#receitasGradient)" stroke="none" />
          <path d={receitasLine} fill="none" stroke="#00d68f" strokeWidth="2.5" strokeLinecap="round" />
          <path d={despesasLine} fill="none" stroke="#f04452" strokeWidth="2" strokeLinecap="round" />

          {activeX !== null && (
            <line
              x1={activeX}
              y1={PADDING_TOP}
              x2={activeX}
              y2={HEIGHT - PADDING_BOTTOM}
              stroke="#2c3648"
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
              fill="#64748b"
            >
              {point.month}
            </text>
          ))}
        </svg>

        {active && activeIndex !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 -translate-x-1/2 rounded-xl border border-[#262F40] bg-[#1a2233] p-3 text-xs shadow-lg shadow-black/40"
            style={{
              left: `${(xFor(activeIndex) / WIDTH) * 100}%`,
              transform:
                activeIndex > data.length - 2 ? 'translateX(-90%)' : activeIndex === 0 ? 'translateX(-10%)' : 'translateX(-50%)',
            }}
          >
            <p className="font-semibold text-white">{active.month}</p>
            <p className="mt-1.5 flex items-center justify-between gap-3 text-emerald-400">
              <span>Receitas</span>
              <span className="font-semibold">{formatCurrency(active.receitas)}</span>
            </p>
            <p className="mt-1 flex items-center justify-between gap-3 text-red-400">
              <span>Despesas</span>
              <span className="font-semibold">{formatCurrency(active.despesas)}</span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Despesas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Receitas
        </span>
      </div>
    </div>
  );
}
