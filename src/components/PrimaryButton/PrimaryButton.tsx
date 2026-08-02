import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, className, disabled, ...rest }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`h-[52px] w-full rounded-xl text-sm font-semibold transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed bg-[#1A4743] text-emerald-700/70'
          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-[0.98]'
      } ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
