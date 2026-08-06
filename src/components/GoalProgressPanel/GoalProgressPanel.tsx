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
      <h2 className="text-base font-semibold text-white">Progresso Geral</h2>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">Economizado</span>
        <span className="font-semibold text-teal-400">{formatCurrency(economizado)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-400">Objetivo</span>
        <span className="font-semibold text-white">{formatCurrency(objetivo)}</span>
      </div>

      <div className="mt-3">
        <ProgressBar value={percentual} heightClassName="h-2.5" />
      </div>

      <p className="mt-5 text-center text-3xl font-bold text-teal-400">{percentual}%</p>
      <p className="text-center text-xs text-slate-500">do total alcançado</p>
    </Card>
  );
}
