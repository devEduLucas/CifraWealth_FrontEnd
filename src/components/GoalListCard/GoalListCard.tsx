import { Calendar, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { Card } from '../Card/Card';
import { Badge } from '../Badge/Badge';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Button } from '../Button/Button';
import { formatCurrency } from '../../utils/validation';
import {
  formatMonthYear,
  getGoalIcon,
  getGoalProgress,
  getGoalProgressColorClassName,
  getGoalStatusBadge,
} from '../../utils/goals';
import type { GoalViewModel } from '../../types/goals.types';

interface GoalListCardProps {
  goal: GoalViewModel;
  onEdit: (goal: GoalViewModel) => void;
  onContribute: (goal: GoalViewModel) => void;
  disabled?: boolean;
  onDelete: (goal: GoalViewModel) => void;
}

export function GoalListCard({ goal, onEdit, onDelete, onContribute, disabled }: GoalListCardProps) {
  const Icon = getGoalIcon(goal.titulo);
  const progress = getGoalProgress(goal);
  const badge = getGoalStatusBadge(goal.status);
  const progressColor = getGoalProgressColorClassName(goal.status);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
            <Icon size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{goal.titulo}</p>
            {goal.descricao && <p className="mt-0.5 text-xs text-slate-400">{goal.descricao}</p>}
          </div>
        </div>
        <Badge label={badge.label} variant={badge.variant} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-lg font-bold text-white">
          {formatCurrency(goal.valorAtual)}
          <span className="ml-1.5 text-sm font-normal text-slate-400">de {formatCurrency(goal.valorObjetivo)}</span>
        </p>
        <p className="text-lg font-bold text-teal-400">{progress}%</p>
      </div>

      <div className="mt-2.5">
        <ProgressBar value={progress} colorClassName={progressColor} />
      </div>

      {goal.status !== 'cancelada' && goal.status !== 'concluida' && (
        <Button className="mt-4 w-full" icon={PiggyBank} disabled={disabled} onClick={() => onContribute(goal)}>Registrar valor guardado</Button>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {goal.dataFim ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={13} />
            {formatMonthYear(goal.dataFim)}
          </span>
        ) : (
          <span className="text-xs text-slate-600">Sem prazo definido</span>
        )}

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Pencil} disabled={disabled} onClick={() => onEdit(goal)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} disabled={disabled} onClick={() => onDelete(goal)}>
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
}
