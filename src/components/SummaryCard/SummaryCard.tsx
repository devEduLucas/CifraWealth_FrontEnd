import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
  footnote: string;
  footnoteClassName: string;
}

export function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  footnote,
  footnoteClassName,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className={`mt-1 text-xs font-medium ${footnoteClassName}`}>{footnote}</p>
    </div>
  );
}
