import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  labelAction?: ReactNode;
}

export function Select({ label, labelAction, children, id, className, ...rest }: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-muted">{label}</label>
        {labelAction}
      </div>
      <select
        id={inputId}
        className={`h-[52px] min-w-0 rounded-xl border border-field-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
