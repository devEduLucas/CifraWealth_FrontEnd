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
        <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
        <p className="mt-1 text-sm text-muted">Defina objetivos financeiros e acompanhe sua evolução.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-line-strong bg-elevated p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                filter === option.value ? 'bg-teal-500/15 text-accent' : 'text-muted hover:text-secondary'
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
