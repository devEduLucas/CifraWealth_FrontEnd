import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? toFieldId(label);
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
        <div
          className={`field-shell ${
            error ? 'border-red-500/60' : 'border-line-strong'
          } ${className ?? ''}`}
        >
          <Lock size={18} className="pointer-events-none absolute left-4 text-subtle" />
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className="pl-11 pr-12 text-sm text-foreground placeholder:text-subtle"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3 rounded-md p-1 text-subtle transition-colors duration-200 hover:text-secondary"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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

PasswordInput.displayName = 'PasswordInput';

function toFieldId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
