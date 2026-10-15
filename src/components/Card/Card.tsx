import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
