interface ProgressBarProps {
  value: number;
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
}

export function ProgressBar({
  value,
  colorClassName = 'bg-teal-400',
  trackClassName = 'bg-[#1c2333]',
  heightClassName = 'h-2',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full overflow-hidden rounded-full ${heightClassName} ${trackClassName}`}>
      <div className={`h-full rounded-full transition-all duration-300 ${colorClassName}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
