import type { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, id, className, ...rest }: CheckboxProps) {
  const inputId = id ?? 'checkbox';
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong bg-elevated accent-accent ${
            className ?? ''
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <label htmlFor={inputId} className="cursor-pointer text-sm leading-relaxed text-muted">
          {label}
        </label>
      </div>
      {error && (
        <span id={errorId} role="alert" className="pl-7 text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
