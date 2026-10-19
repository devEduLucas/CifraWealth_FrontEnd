import { Card } from '../Card/Card';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { formatCurrency } from '../../utils/validation';

interface GoalProgressPanelProps {
  economizado: number;
  objetivo: number;
  percentual: number;
}

export function GoalProgressPanel({ economizado, objetivo, percentual }: GoalProgressPanelProps) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground">Progresso Geral</h2>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted">Economizado</span>
        <span className="font-semibold text-progress">{formatCurrency(economizado)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">Objetivo</span>
        <span className="font-semibold text-foreground">{formatCurrency(objetivo)}</span>
      </div>

      <div className="mt-3">
        <ProgressBar value={percentual} heightClassName="h-2.5" />
      </div>

      <p className="mt-5 text-center text-3xl font-bold text-progress">{percentual}%</p>
      <p className="text-center text-xs text-subtle">do total alcançado</p>
    </Card>
  );
}
