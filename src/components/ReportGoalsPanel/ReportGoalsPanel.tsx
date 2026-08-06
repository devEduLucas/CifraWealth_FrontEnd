import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import type { GoalPerformanceItem } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';

interface ReportGoalsPanelProps {
  goals: GoalPerformanceItem[];
}

export function ReportGoalsPanel({ goals }: ReportGoalsPanelProps) {
  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Desempenho das Metas</h2>
          <p className="mt-0.5 text-xs text-slate-400">Progresso acumulado</p>
        </div>
        <Link
          to="/goals"
          className="shrink-0 rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-400"
        >
          + Nova meta
        </Link>
      </div>

      {goals.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-5">
          {goals.map((goal) => {
            const progress =
              goal.valorAlvo > 0 ? Math.min(Math.round((goal.valorAtual / goal.valorAlvo) * 100), 100) : 0;
            return (
              <li key={goal.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
                    <Target size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{goal.nome}</p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(goal.valorAtual)} / {formatCurrency(goal.valorAlvo)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-semibold text-teal-400">
                    {progress}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1c2333]">
                  <div className="h-full rounded-full bg-teal-400" style={{ width: `${progress}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#2c3648] py-8 text-center">
          <p className="text-sm font-medium text-slate-300">Você ainda não criou nenhuma meta.</p>
          <p className="text-xs text-slate-500">Crie sua primeira meta financeira e acompanhe o progresso aqui.</p>
          <Link
            to="/goals"
            className="mt-3 rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-400"
          >
            + Criar primeira meta
          </Link>
        </div>
      )}
    </div>
  );
}
