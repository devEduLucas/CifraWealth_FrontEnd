import { BarChart3, Lightbulb, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../Card/Card';

interface Tip {
  id: string;
  icon: LucideIcon;
  iconClassName: string;
  texto: string;
}

const TIPS: Tip[] = [
  {
    id: 'despesas-fixas',
    icon: BarChart3,
    iconClassName: 'bg-teal-500/15 text-teal-400',
    texto: 'Evite gastar mais de 30% da sua renda com despesas fixas mensais.',
  },
  {
    id: 'reserva-emergencia',
    icon: ShieldCheck,
    iconClassName: 'bg-red-500/15 text-red-400',
    texto: 'Monte uma reserva de emergência equivalente a 6 meses de despesas.',
  },
  {
    id: 'investir-regularmente',
    icon: TrendingUp,
    iconClassName: 'bg-teal-500/15 text-teal-400',
    texto: 'Invista regularmente, mesmo que pequenos valores, para o longo prazo.',
  },
  {
    id: 'revisar-metas',
    icon: RefreshCw,
    iconClassName: 'bg-amber-500/15 text-amber-400',
    texto: 'Revise suas metas financeiras todo mês para manter o foco.',
  },
];

export function TipsCard() {
  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <Lightbulb size={15} />
        </span>
        <h2 className="text-base font-semibold text-white">Dicas Financeiras</h2>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-[#202634]">
        {TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <li key={tip.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tip.iconClassName}`}>
                <Icon size={14} />
              </span>
              <p className="text-sm text-slate-300">{tip.texto}</p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
