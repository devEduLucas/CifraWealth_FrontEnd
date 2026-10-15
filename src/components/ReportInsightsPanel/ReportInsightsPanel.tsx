import { Info, Sparkles } from 'lucide-react';
import type { ReportInsight, ReportInsightType } from '../../types/reports.types';

interface ReportInsightsPanelProps {
  insights: ReportInsight[];
}

const ICONS: Record<ReportInsightType, { icon: typeof Sparkles; className: string }> = {
  positivo: { icon: Sparkles, className: 'bg-teal-500/15 text-accent' },
  negativo: { icon: Info, className: 'bg-red-500/15 text-danger' },
  neutro: { icon: Info, className: 'bg-sky-500/15 text-info' },
};

export function ReportInsightsPanel({ insights }: ReportInsightsPanelProps) {
  const hasInsights = insights.length > 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-accent">
          <Sparkles size={15} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">Insights Financeiros</h2>
          <p className="text-xs text-muted">
            {hasInsights ? 'Gerado para o período selecionado' : 'Ainda não há dados suficientes'}
          </p>
        </div>
      </div>

      {hasInsights ? (
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {insights.map((insight) => {
            const { icon: Icon, className } = ICONS[insight.tipo];
            return (
              <li key={insight.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}>
                  <Icon size={14} />
                </span>
                <p className="text-sm text-secondary">{insight.mensagem}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted">
          <p>Registre suas primeiras receitas e despesas para começarmos a gerar insights automáticos.</p>
          <p>Assim que houver movimentações suficientes, mostraremos aqui como seu dinheiro está se comportando.</p>
        </div>
      )}
    </div>
  );
}
