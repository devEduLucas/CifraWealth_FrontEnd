import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
  footnote: string;
  footnoteClassName: string;
  compact?: boolean;
}

export function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  footnote,
  footnoteClassName,
  compact = false,
}: SummaryCardProps) {
  return (
    <div className={compact ? 'min-w-0 rounded-xl bg-elevated/50 p-4' : 'rounded-2xl border border-line bg-surface p-5'}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <p className={compact ? 'mt-2 break-words text-xl font-bold tabular-nums text-foreground sm:text-2xl' : 'mt-3 text-2xl font-bold text-foreground'}>{value}</p>
      <p className={`mt-1 text-xs font-medium ${footnoteClassName}`}>{footnote}</p>
    </div>
  );
}
