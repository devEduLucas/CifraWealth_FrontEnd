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
          className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#353A47] bg-[#161F32] accent-teal-500 ${
            className ?? ''
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <label htmlFor={inputId} className="cursor-pointer text-sm leading-relaxed text-slate-400">
          {label}
        </label>
      </div>
      {error && (
        <span id={errorId} role="alert" className="pl-7 text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
