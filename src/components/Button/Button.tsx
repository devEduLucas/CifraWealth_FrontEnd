import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-teal-500 text-slate-950 hover:bg-teal-400',
  secondary: 'bg-[#161F32] text-slate-200 border border-[#262F40] hover:border-teal-400/60 hover:text-teal-400',
  outline: 'bg-transparent text-slate-200 border border-[#262F40] hover:border-teal-400/60 hover:text-teal-400',
  ghost: 'bg-transparent text-slate-300 hover:text-teal-400',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
