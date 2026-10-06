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
        iconClassName="bg-teal-500/15 text-teal-400"
        footnote={metasAtivas === 0 ? 'Nenhuma meta em andamento.' : 'Em andamento'}
        footnoteClassName="text-slate-500"
      />
      <SummaryCard
        label="Valor Objetivo"
        value={formatCurrency(valorObjetivo)}
        icon={DollarSign}
        iconClassName="bg-sky-500/15 text-sky-400"
        footnote="Soma das metas não canceladas"
        footnoteClassName="text-slate-500"
      />
      <SummaryCard
        label="Valor Economizado"
        value={formatCurrency(valorEconomizado)}
        icon={Heart}
        iconClassName="bg-teal-500/15 text-teal-400"
        footnote="Total guardado até agora"
        footnoteClassName="text-slate-500"
      />
      <SummaryCard
        label="Progresso Geral"
        value={`${progressoGeralPercentual}%`}
        icon={BarChart3}
        iconClassName="bg-amber-500/15 text-amber-400"
        footnote="Do total alcançado"
        footnoteClassName="text-slate-500"
      />
    </div>
  );
}
