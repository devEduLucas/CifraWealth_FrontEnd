import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  labelAction?: ReactNode;
}

export function Select({ label, labelAction, children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-400">{label}</label>
        {labelAction}
      </div>
      <select
        className="h-[52px] rounded-xl border border-[#262F40] bg-[#161F32] px-4 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400/60"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
