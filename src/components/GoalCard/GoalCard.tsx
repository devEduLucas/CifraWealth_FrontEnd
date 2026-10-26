import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import type { GoalItem } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/validation';
import { getGoalProgress } from '../../utils/goalProgress';

interface GoalCardProps {
  goal: GoalItem;
  valuesVisible?: boolean;
}

export function GoalCard({ goal, valuesVisible = true }: GoalCardProps) {
  const progress = getGoalProgress({ valorAtual: goal.valorAtual, valorObjetivo: goal.valorAlvo });

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-progress/10 text-progress">
          <PiggyBank size={19} />
        </span>
        <span className="rounded-full bg-progress/10 px-2.5 py-1 text-xs font-semibold text-progress">
          {valuesVisible ? `${progress}%` : '•••'}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">{goal.nome}</p>
      <p className="mt-0.5 text-xs text-muted">
        {valuesVisible ? `${formatCurrency(goal.valorAtual)} / ${formatCurrency(goal.valorAlvo)}` : 'Valores ocultos'}
      </p>

      {valuesVisible && <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hover">
        <div className="h-full rounded-full bg-progress" style={{ width: `${progress}%` }} />
      </div>}
      <Link to={`/goals?contribute=${goal.id}`} className="mt-4 inline-block text-sm font-semibold text-accent-ink hover:underline">Registrar valor guardado</Link>
    </div>
  );
}
