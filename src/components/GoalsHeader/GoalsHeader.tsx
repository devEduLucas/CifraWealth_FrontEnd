import { Plus } from 'lucide-react';
import { Button } from '../Button/Button';
import type { GoalFilter } from '../../types/goals.types';

interface GoalsHeaderProps {
  filter: GoalFilter;
  onFilterChange: (filter: GoalFilter) => void;
  onNewGoal: () => void;
}

const FILTERS: { value: GoalFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluidas', label: 'Concluídas' },
];

export function GoalsHeader({ filter, onFilterChange, onNewGoal }: GoalsHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
        <p className="mt-1 text-sm text-slate-400">Defina objetivos financeiros e acompanhe sua evolução.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-[#262F40] bg-[#161F32] p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                filter === option.value ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Button icon={Plus} onClick={onNewGoal}>
          Nova Meta
        </Button>
      </div>
    </div>
  );
}
