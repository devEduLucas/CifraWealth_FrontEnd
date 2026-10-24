import { Card } from '../Card/Card';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { formatCurrency } from '../../utils/validation';

interface GoalProgressPanelProps {
  economizado: number;
  objetivo: number;
  percentual: number;
  valuesVisible?: boolean;
}

export function GoalProgressPanel({ economizado, objetivo, percentual, valuesVisible = true }: GoalProgressPanelProps) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground">Progresso Geral</h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 text-sm">
        <span className="text-muted">Economizado</span>
        <span className="font-semibold text-progress">{valuesVisible ? formatCurrency(economizado) : 'R$ ••••••'}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-sm">
        <span className="text-muted">Objetivo</span>
        <span className="font-semibold text-foreground">{valuesVisible ? formatCurrency(objetivo) : 'R$ ••••••'}</span>
      </div>

      {valuesVisible && <div className="mt-3">
        <ProgressBar value={percentual} heightClassName="h-2.5" />
      </div>}

      <p className="mt-5 text-center text-3xl font-bold text-progress">{valuesVisible ? `${percentual}%` : '•••'}</p>
      <p className="text-center text-xs text-subtle">{valuesVisible ? 'do total alcançado' : 'Valores e progresso ocultos'}</p>
    </Card>
  );
}
