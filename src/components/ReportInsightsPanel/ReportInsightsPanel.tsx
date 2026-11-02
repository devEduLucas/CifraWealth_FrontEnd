import { Info, Sparkles } from 'lucide-react';
import type { ReportInsight, ReportInsightType } from '../../types/reports.types';

interface ReportInsightsPanelProps {
  insights: ReportInsight[];
  compact?: boolean;
  className?: string;
}

const ICONS: Record<ReportInsightType, { icon: typeof Sparkles; className: string }> = {
  positivo: { icon: Sparkles, className: 'bg-positive/10 text-positive' },
  negativo: { icon: Info, className: 'bg-danger/15 text-danger' },
  neutro: { icon: Info, className: 'bg-info/15 text-info' },
};

export function ReportInsightsPanel({ insights, compact = false, className = '' }: ReportInsightsPanelProps) {
  const hasInsights = insights.length > 0;

  return (
    <section aria-label={compact ? 'Destaques do período' : 'Insights Financeiros'} data-tone="balance" className={'h-full min-w-0 rounded-2xl p-5 sm:p-6 ' + (compact ? 'finance-tint ' : 'border border-line bg-surface ') + className}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-ink">
          <Sparkles size={15} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{compact ? 'Destaques do período' : 'Insights Financeiros'}</h2>
          {!compact && <p className="text-xs text-muted">
            {hasInsights ? 'Gerado para o período selecionado' : 'Ainda não há dados suficientes'}
          </p>}
        </div>
      </div>

      {hasInsights ? (
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {(compact ? insights.slice(0, 2) : insights).map((insight) => {
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
          <p>Registre receitas e despesas para ver os destaques do período.</p>
        </div>
      )}
    </section>
  );
}
