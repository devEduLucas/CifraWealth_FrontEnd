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
        <label htmlFor={inputId} className="text-sm font-medium text-slate-400">
          {label}
        </label>
        <div
          className={`flex h-[52px] items-center gap-3 rounded-xl border bg-[#161F32] px-4 transition-colors duration-200 focus-within:border-emerald-400/60 ${
            error ? 'border-red-500/60' : 'border-[#262F40]'
          } ${className ?? ''}`}
        >
          <Lock size={18} className="shrink-0 text-slate-500" />
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="shrink-0 text-slate-500 transition-colors duration-200 hover:text-slate-300"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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

PasswordInput.displayName = 'PasswordInput';

function toFieldId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}
