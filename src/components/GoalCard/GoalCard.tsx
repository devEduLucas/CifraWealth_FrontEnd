import { Link } from 'react-router-dom';
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
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-words text-sm font-semibold text-foreground">{goal.nome}</p>
        <span className="shrink-0 text-xs font-semibold text-progress">
          {valuesVisible ? `${progress}%` : '•••'}
        </span>
      </div>

      <p className="mt-0.5 text-xs text-muted">
        {valuesVisible ? `${formatCurrency(goal.valorAtual)} de ${formatCurrency(goal.valorAlvo)}` : 'Valores ocultos'}
      </p>

      {valuesVisible && <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hover" aria-hidden="true">
        <div className="h-full rounded-full bg-progress" style={{ width: `${progress}%` }} />
      </div>}
      <Link to={`/goals/${goal.id}?guardar=1`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink hover:underline">Registrar valor guardado</Link>
    </div>
  );
}
