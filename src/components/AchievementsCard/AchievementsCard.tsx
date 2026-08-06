import { Card } from '../Card/Card';
import { formatCurrency } from '../../utils/validation';
import { formatMonthYear } from '../../utils/goals';
import type { AchievementItem } from '../../types/goals.types';

interface AchievementsCardProps {
  items: AchievementItem[];
}

export function AchievementsCard({ items }: AchievementsCardProps) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-white">Próximas Conquistas</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Você ainda não possui conquistas.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[#202634]">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{item.titulo}</p>
                  <p className="text-xs text-teal-400">Faltam {formatCurrency(item.faltam)}</p>
                  {item.dataFim && (
                    <p className="mt-0.5 text-xs text-slate-500">Meta: {formatMonthYear(item.dataFim)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
