import { Heart, Target, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/validation';

interface GoalSummaryCardsProps {
  metasAtivas: number;
  valorObjetivo: number;
  valorEconomizado: number;
  progressoGeralPercentual: number;
  valuesVisible?: boolean;
}

export function GoalSummaryCards({
  metasAtivas,
  valorObjetivo,
  valorEconomizado,
  progressoGeralPercentual,
  valuesVisible = true,
}: GoalSummaryCardsProps) {
  const cards = [
    { label: 'Metas Ativas', value: String(metasAtivas), icon: Target, color: 'bg-accent/10 text-accent-ink', footnote: metasAtivas === 0 ? 'Nenhuma meta em andamento.' : 'Em andamento' },
    { label: 'Valor Objetivo', value: valuesVisible ? formatCurrency(valorObjetivo) : 'R$ ••••••', icon: DollarSign, color: 'bg-info/15 text-info', footnote: 'Soma das metas não canceladas' },
    { label: 'Valor Economizado', value: valuesVisible ? formatCurrency(valorEconomizado) : 'R$ ••••••', icon: Heart, color: 'bg-progress/10 text-progress', footnote: 'Total guardado até agora' },
    { label: 'Progresso Geral', value: valuesVisible ? `${progressoGeralPercentual}%` : '•••', icon: BarChart3, color: 'bg-warning/15 text-warning', footnote: 'Do total alcançado' },
  ];
  return (
    <section aria-label="Indicadores das metas" className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, footnote }) => (
        <div key={label} className="min-w-0 rounded-2xl border border-line bg-surface p-3 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:items-center">
            <p className="min-w-0 text-xs text-muted sm:text-sm">{label}</p>
            <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex ${color}`}><Icon size={16} aria-hidden="true" /></span>
          </div>
          <p className="mt-2 break-words text-base font-bold text-foreground sm:mt-3 sm:text-2xl">{value}</p>
          <p className="mt-1 hidden text-xs font-medium text-subtle sm:block">{footnote}</p>
        </div>
      ))}
    </section>
  );
}
