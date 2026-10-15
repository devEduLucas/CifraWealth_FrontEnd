import type { LucideIcon } from 'lucide-react';
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
    'flex flex-1 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left text-sm font-medium text-secondary transition-colors hover:border-line-strong hover:bg-surface';

  const content = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon size={16} />
      </span>
      {label}
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
