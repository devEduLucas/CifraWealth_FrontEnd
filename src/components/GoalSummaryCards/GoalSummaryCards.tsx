import { Heart, Target, DollarSign, BarChart3 } from 'lucide-react';
import { SummaryCard } from '../SummaryCard/SummaryCard';
import { formatCurrency } from '../../utils/validation';

interface GoalSummaryCardsProps {
  metasAtivas: number;
  valorObjetivo: number;
  valorEconomizado: number;
  progressoGeralPercentual: number;
}

export function GoalSummaryCards({
  metasAtivas,
  valorObjetivo,
  valorEconomizado,
  progressoGeralPercentual,
}: GoalSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Metas Ativas"
        value={String(metasAtivas)}
        icon={Target}
        iconClassName="bg-accent/10 text-accent-ink"
        footnote={metasAtivas === 0 ? 'Nenhuma meta em andamento.' : 'Em andamento'}
        footnoteClassName="text-subtle"
      />
      <SummaryCard
        label="Valor Objetivo"
        value={formatCurrency(valorObjetivo)}
        icon={DollarSign}
        iconClassName="bg-info/15 text-info"
        footnote="Soma das metas não canceladas"
        footnoteClassName="text-subtle"
      />
      <SummaryCard
        label="Valor Economizado"
        value={formatCurrency(valorEconomizado)}
        icon={Heart}
        iconClassName="bg-progress/10 text-progress"
        footnote="Total guardado até agora"
        footnoteClassName="text-subtle"
      />
      <SummaryCard
        label="Progresso Geral"
        value={`${progressoGeralPercentual}%`}
        icon={BarChart3}
        iconClassName="bg-warning/15 text-warning"
        footnote="Do total alcançado"
        footnoteClassName="text-subtle"
      />
    </div>
  );
}
