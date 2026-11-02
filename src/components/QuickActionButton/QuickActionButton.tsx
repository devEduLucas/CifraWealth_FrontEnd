import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  to?: string;
  onClick?: () => void;
  tone?: 'income' | 'expense';
}

export function QuickActionButton({ label, icon: Icon, iconClassName, to, onClick, tone }: QuickActionButtonProps) {
  const className =
    'finance-tint group flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-foreground transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

  const content = (
    <>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight size={16} aria-hidden="true" className="hidden shrink-0 text-subtle group-hover:text-accent-ink sm:block" />
    </>
  );

  if (to) {
    return (
      <Link to={to} data-tone={tone} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} data-tone={tone} className={className}>
      {content}
    </button>
  );
}
