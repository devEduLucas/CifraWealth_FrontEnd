import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
  footnote: string;
  footnoteClassName: string;
  compact?: boolean;
  tone?: 'income' | 'expense' | 'balance' | 'saving';
}

export function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  footnote,
  footnoteClassName,
  compact = false,
  tone,
}: SummaryCardProps) {
  return (
    <div data-tone={tone} className={(compact ? 'min-w-0 rounded-xl p-4 ' : 'rounded-2xl p-5 ') + (tone ? 'finance-tint' : compact ? 'bg-elevated/50' : 'border border-line bg-surface')}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <p className={compact ? 'mt-2 break-words text-xl font-bold tabular-nums text-foreground sm:text-2xl' : 'mt-3 text-2xl font-bold text-foreground'}>{value}</p>
      {footnote && <p className={`mt-1 text-xs font-medium ${footnoteClassName}`}>{footnote}</p>}
    </div>
  );
}
