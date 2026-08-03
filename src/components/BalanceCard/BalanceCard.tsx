import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/validation';

interface BalanceCardProps {
  total: number;
  variacaoPercentual?: number;
}

export function BalanceCard({ total, variacaoPercentual }: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#202634] bg-[#121827] p-6">
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-400">Saldo Total</p>
        <button
          type="button"
          aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
          onClick={() => setVisible((prev) => !prev)}
          className="text-slate-500 transition-colors hover:text-slate-300"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <p className={`mt-2 text-4xl font-bold tracking-tight ${total < 0 ? 'text-red-400' : 'text-white'}`}>
        {visible ? formatCurrency(total) : 'R$ ••••••'}
      </p>

      {variacaoPercentual !== undefined && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          {variacaoPercentual >= 0 ? '↑' : '↓'} {variacaoPercentual >= 0 ? '+' : ''}
          {variacaoPercentual.toString().replace('.', ',')}%
          <span className="font-normal text-emerald-400/80">em relação ao mês anterior</span>
        </span>
      )}

      <svg
        viewBox="0 0 160 60"
        className="pointer-events-none absolute bottom-4 right-4 h-14 w-36 opacity-90"
        preserveAspectRatio="none"
      >
        <path
          d="M0,45 C20,48 30,38 45,36 C60,34 65,44 80,40 C95,36 100,20 115,16 C130,12 140,18 160,4"
          fill="none"
          stroke="#00d68f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
