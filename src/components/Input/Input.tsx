import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, icon, error, helperText, id, className, 'aria-describedby': describedBy, 'aria-invalid': ariaInvalid, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-help`;
    const errorId = `${inputId}-error`;
    const descriptionIds = [describedBy, helperText ? helperId : undefined, error ? errorId : undefined].filter(Boolean).join(' ');

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
          {icon && <span aria-hidden="true" className="pointer-events-none absolute left-4 text-subtle">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`px-4 text-sm text-foreground placeholder:text-subtle ${icon ? 'pl-11' : ''}`}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={descriptionIds || undefined}
            {...rest}
          />
        </div>
        {helperText && (
          <p id={helperId} className="text-xs leading-5 text-subtle">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

