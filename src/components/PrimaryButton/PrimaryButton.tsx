import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, className, disabled, ...rest }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`h-[52px] w-full rounded-xl text-sm font-semibold transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed bg-accent/10 text-accent-ink/60'
          : 'bg-accent text-on-accent hover:bg-accent-hover active:scale-[0.98]'
      } ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  );
}
