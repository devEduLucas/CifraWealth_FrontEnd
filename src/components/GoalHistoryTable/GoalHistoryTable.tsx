import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { formatCurrency } from '../../utils/validation';
import { formatMonthYear, getGoalStatusBadge } from '../../utils/goals';
import type { GoalViewModel } from '../../types/goals.types';

interface GoalHistoryTableProps {
  goals: GoalViewModel[];
  onView: (goal: GoalViewModel) => void;
  onEdit: (goal: GoalViewModel) => void;
  onDelete: (goal: GoalViewModel) => void;
}

export function GoalHistoryTable({ goals, onView, onEdit, onDelete }: GoalHistoryTableProps) {
  return (
    <Card>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Histórico de Metas</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-3 font-medium">Nome</th>
              <th className="pb-3 font-medium">Objetivo</th>
              <th className="pb-3 font-medium">Economizado</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Data Final</th>
              <th className="pb-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202634]">
            {goals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  Nenhuma meta cadastrada.
                </td>
              </tr>
            ) : (
              goals.map((goal) => {
                const badge = getGoalStatusBadge(goal.status);
                return (
                  <tr key={goal.id}>
                    <td className="py-3.5 font-semibold text-white">{goal.titulo}</td>
                    <td className="py-3.5 text-slate-300">{formatCurrency(goal.valorObjetivo)}</td>
                    <td className="py-3.5 font-semibold text-teal-400">{formatCurrency(goal.valorAtual)}</td>
                    <td className="py-3.5">
                      <Badge label={badge.label} variant={badge.variant} />
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {goal.dataFim ? formatMonthYear(goal.dataFim) : '—'}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" icon={Eye} onClick={() => onView(goal)}>
                          Visualizar
                        </Button>
                        <Button variant="secondary" size="sm" icon={Pencil} onClick={() => onEdit(goal)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(goal)}>
                          Excluir
                        </Button>
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
