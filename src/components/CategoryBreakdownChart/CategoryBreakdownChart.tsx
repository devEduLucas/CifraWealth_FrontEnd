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
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Despesas por Categoria</h2>
      <p className="mt-0.5 text-xs text-muted">Distribuição do período</p>

      {hasData ? (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
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

          <ul className="flex flex-1 flex-col gap-2.5 self-stretch">
            {data.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-secondary">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.cor }} />
                  {item.nome} · {formatCurrency(item.total)}
                </span>
                <span className="font-semibold text-foreground">{item.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <span className="h-16 w-16 rounded-full border-2 border-dashed border-line-strong" />
          <p className="mt-2 text-sm font-medium text-secondary">Nenhuma despesa confirmada neste período.</p>
          <p className="text-xs text-subtle">
            Registre uma despesa ou selecione outras datas para ver a distribuição.
          </p>
        </div>
      )}
    </div>
  );
}
