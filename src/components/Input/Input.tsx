import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, id, className, ...rest }, ref) => {
    const inputId = id ?? toFieldId(label);
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-400">
          {label}
        </label>
        <div
          className={`field-shell ${
            error ? 'border-red-500/60' : 'border-[#262F40]'
          } ${className ?? ''}`}
        >
          {icon && <span className="pointer-events-none absolute left-4 text-slate-500">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`px-4 text-sm text-slate-100 placeholder:text-slate-500 ${icon ? 'pl-11' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
        </div>
        {error && (
          <span id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

function toFieldId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
