import { useId } from 'react';
import { Eye, PiggyBank } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { formatCurrency } from '../../utils/validation';
import { formatMonthYear, getGoalStatusBadge } from '../../utils/goals';
import type { GoalViewModel } from '../../types/goals.types';

interface GoalHistoryTableProps {
  goals: GoalViewModel[];
  onView: (goal: GoalViewModel) => void;
  onContribute: (goal: GoalViewModel) => void;
  disabled?: boolean;
  valuesVisible?: boolean;
}

export function GoalHistoryTable({ goals, onView, onContribute, disabled, valuesVisible = true }: GoalHistoryTableProps) {
  const tableTitleId = useId();
  return (
    <Card>
      <h2 id={tableTitleId} className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">Resumo das metas</h2>

      <div role="region" tabIndex={0} aria-labelledby={tableTitleId} className="overflow-x-auto rounded-md">
        <table aria-labelledby={tableTitleId} className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-subtle">
              <th scope="col" className="pb-3 font-medium">Nome</th>
              <th scope="col" className="pb-3 font-medium">Objetivo</th>
              <th scope="col" className="pb-3 font-medium">Economizado</th>
              <th scope="col" className="pb-3 font-medium">Status</th>
              <th scope="col" className="pb-3 font-medium">Data Final</th>
              <th scope="col" className="pb-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {goals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-subtle">
                  Nenhuma meta cadastrada.
                </td>
              </tr>
            ) : (
              goals.map((goal) => {
                const badge = getGoalStatusBadge(goal.status);
                return (
                  <tr key={goal.id}>
                    <td className="py-3.5 font-semibold text-foreground">{goal.titulo}</td>
                    <td className="py-3.5 text-secondary">{valuesVisible ? formatCurrency(goal.valorObjetivo) : 'R$ ••••••'}</td>
                    <td className="py-3.5 font-semibold text-progress">{valuesVisible ? formatCurrency(goal.valorAtual) : 'R$ ••••••'}</td>
                    <td className="py-3.5">
                      <Badge label={badge.label} variant={badge.variant} />
                    </td>
                    <td className="py-3.5 text-muted">
                      {goal.dataFim ? formatMonthYear(goal.dataFim) : '—'}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" icon={Eye} disabled={disabled} onClick={() => onView(goal)}>
                          Detalhes
                        </Button>
                        {goal.status !== 'cancelada' && goal.status !== 'concluida' && <Button size="sm" icon={PiggyBank} disabled={disabled} onClick={() => onContribute(goal)}>Registrar valor</Button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
