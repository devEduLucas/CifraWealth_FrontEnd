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
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
        <div
          className={`field-shell ${
            error ? 'border-danger/60' : 'border-field-border'
          } ${className ?? ''}`}
        >
          {icon && <span className="pointer-events-none absolute left-4 text-subtle">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`px-4 text-sm text-foreground placeholder:text-subtle ${icon ? 'pl-11' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
        </div>
        {error && (
          <span id={errorId} role="alert" className="text-xs text-danger">
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
