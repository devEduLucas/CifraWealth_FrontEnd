import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  labelAction?: ReactNode;
}

export function Select({ label, labelAction, children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted">{label}</label>
        {labelAction}
      </div>
      <select
        className="h-[52px] rounded-xl border border-line-strong bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-emerald-400/60"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
