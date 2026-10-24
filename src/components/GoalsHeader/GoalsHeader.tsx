import { Plus } from 'lucide-react';
import { Button } from '../Button/Button';
import { FinancialPrivacyButton } from '../FinancialPrivacyButton/FinancialPrivacyButton';
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
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
        <p className="mt-1 text-sm text-muted">Defina objetivos financeiros e acompanhe sua evolução.</p>
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto">
        <div role="group" aria-label="Filtrar metas por situação" className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-line-strong bg-elevated p-1">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => onFilterChange(option.value)}
              className={`min-h-11 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:px-3.5 ${
                filter === option.value ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:text-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <FinancialPrivacyButton />
        <Button icon={Plus} onClick={onNewGoal}>
          Nova Meta
        </Button>
      </div>
    </div>
  );
}
