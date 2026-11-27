import { useRef } from 'react';
import { useChartMotion } from '../../hooks/useChartMotion';

interface ProgressBarProps {
  value: number;
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
}

export function ProgressBar({
  value,
  colorClassName = 'bg-progress',
  trackClassName = 'bg-line',
  heightClassName = 'h-2',
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const clamped = Math.min(Math.max(value, 0), 100);
  useChartMotion(ref, String(clamped), clamped > 0);

  return (
    <div ref={ref} className={`w-full overflow-hidden rounded-full ${heightClassName} ${trackClassName}`}>
      <div data-chart-motion="progress" className={`h-full rounded-full ${colorClassName}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
