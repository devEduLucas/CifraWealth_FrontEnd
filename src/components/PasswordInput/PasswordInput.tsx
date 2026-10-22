import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, helperText, id, className, 'aria-describedby': describedBy, 'aria-invalid': ariaInvalid, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
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
          <Lock size={18} aria-hidden="true" className="pointer-events-none absolute left-4 text-subtle" />
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className="pl-11 pr-12 text-sm text-foreground placeholder:text-subtle"
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={descriptionIds || undefined}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3 rounded-md p-1 text-subtle transition-colors duration-200 hover:text-secondary"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
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

PasswordInput.displayName = 'PasswordInput';

