import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export function SocialButton({ icon, children, className, ...rest }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-hover text-sm font-medium text-secondary transition-colors duration-200 hover:bg-line ${
        className ?? ''
      }`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
