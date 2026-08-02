import { Target } from 'lucide-react';
import type { GoalItem } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/validation';

interface GoalCardProps {
  goal: GoalItem;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = goal.valorAlvo > 0 ? Math.min(Math.round((goal.valorAtual / goal.valorAlvo) * 100), 100) : 0;

  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Target size={19} />
        </span>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          {progress}%
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-white">{goal.nome}</p>
      <p className="mt-0.5 text-xs text-slate-400">
        {formatCurrency(goal.valorAtual)} / {formatCurrency(goal.valorAlvo)}
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1c2333]">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
