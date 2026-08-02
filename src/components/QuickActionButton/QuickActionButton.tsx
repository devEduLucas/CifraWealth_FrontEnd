import type { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  onClick?: () => void;
}

export function QuickActionButton({
  label,
  icon: Icon,
  iconClassName,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center gap-3 rounded-2xl border border-[#202634] bg-[#121827] px-4 py-3.5 text-left text-sm font-medium text-slate-200 transition-colors hover:border-[#2c3648] hover:bg-[#161c29]"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon size={16} />
      </span>
      {label}
    </button>
  );
}
