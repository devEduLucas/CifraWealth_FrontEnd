import { Target } from 'lucide-react';
import { Card } from '../Card/Card';
import { Button } from '../Button/Button';

interface EmptyGoalsProps {
  onNewGoal: () => void;
}

export function EmptyGoals({ onNewGoal }: EmptyGoalsProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
        <Target size={30} />
      </span>
      <p className="text-base font-semibold text-white">Você ainda não possui metas.</p>
      <p className="max-w-sm text-sm text-slate-400">
        Crie sua primeira meta financeira para começar a acompanhar sua evolução.
      </p>
      <Button className="mt-2" onClick={onNewGoal}>
        Nova Meta
      </Button>
    </Card>
  );
}
