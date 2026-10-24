import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  to?: string;
  onClick?: () => void;
}

export function QuickActionButton({ label, icon: Icon, iconClassName, to, onClick }: QuickActionButtonProps) {
  const className =
    'group flex min-h-20 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-accent/25 bg-surface px-4 py-4 text-left text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-accent hover:bg-accent/5';

  const content = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon size={21} aria-hidden="true" />
      </span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-subtle group-hover:text-accent-ink" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
