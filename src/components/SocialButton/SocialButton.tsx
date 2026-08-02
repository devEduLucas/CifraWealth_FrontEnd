import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export function SocialButton({ icon, children, className, ...rest }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#262F40] bg-[#1B212F] text-sm font-medium text-slate-200 transition-colors duration-200 hover:bg-[#232A3B] ${
        className ?? ''
      }`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
