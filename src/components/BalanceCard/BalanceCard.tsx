import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/validation';

interface BalanceCardProps {
  total: number;
}

export function BalanceCard({ total }: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="rounded-2xl border border-[#202634] bg-[#121827] p-6">
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
    </div>
  );
}
