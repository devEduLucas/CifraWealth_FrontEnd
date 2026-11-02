import type { ReportCategoryBreakdownItem } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';

interface CategoryBreakdownChartProps {
  data: ReportCategoryBreakdownItem[];
  total: number;
}

const SIZE = 160;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryBreakdownChart({ data, total }: CategoryBreakdownChartProps) {
  const hasData = data.length > 0 && total > 0;

  let offset = 0;
  const segments = data.map((item) => {
    const dash = (item.percentual / 100) * CIRCUMFERENCE;
    const segment = { id: item.id, cor: item.cor, dash, offset };
    offset += dash;
    return segment;
  });

  return (
    <section aria-label="Despesas por Categoria" className="flex h-full min-w-0 flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Despesas por Categoria</h2>

      {hasData ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-5">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg aria-hidden="true" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--chart-grid)" strokeWidth={STROKE} />
              {segments.map((segment) => (
                <circle
                  key={segment.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.cor}
                  strokeWidth={STROKE}
                  strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                  strokeDashoffset={-segment.offset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-subtle">Total</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(total)}</p>
            </div>
          </div>

          <ul className="flex min-w-0 flex-col gap-3 self-stretch">
            {data.map((item) => (
              <li key={item.id} className="flex min-w-0 items-start justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-start gap-2 text-secondary">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.cor }} />
                  <span className="min-w-0"><span className="block break-words font-medium">{item.nome}</span><span className="mt-0.5 block font-semibold tabular-nums text-foreground">{formatCurrency(item.total)}</span></span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">{item.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 flex min-h-48 flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span aria-hidden="true" className="h-16 w-16 rounded-full border-2 border-dashed border-danger/40 bg-danger/10" />
          <p className="mt-2 text-sm font-medium text-secondary">Nenhuma despesa confirmada neste período.</p>
        </div>
      )}
    </section>
  );
}
