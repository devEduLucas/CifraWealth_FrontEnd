import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
