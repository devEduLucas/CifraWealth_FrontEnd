import { TrendingUp } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
        <TrendingUp size={18} className="text-emerald-400" />
      </span>
      <span className="text-lg font-bold tracking-tight">
        <span className="text-white">SMART</span>
        <span className="text-emerald-400">FINANCE</span>
      </span>
    </div>
  );
}
