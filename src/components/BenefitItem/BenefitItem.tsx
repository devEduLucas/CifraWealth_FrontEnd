import type { ReactNode } from 'react';

interface BenefitItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 pt-1">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
