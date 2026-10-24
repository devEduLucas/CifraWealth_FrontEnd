import { Card } from '../Card/Card';
import { formatCurrency } from '../../utils/validation';
import { formatMonthYear } from '../../utils/goals';
import type { AchievementItem } from '../../types/goals.types';

interface AchievementsCardProps {
  items: AchievementItem[];
  valuesVisible?: boolean;
}

export function AchievementsCard({ items, valuesVisible = true }: AchievementsCardProps) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground">Próximas Conquistas</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Você ainda não possui conquistas.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-progress/10 text-progress">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{item.titulo}</p>
                  <p className="text-xs text-progress">{valuesVisible ? `Faltam ${formatCurrency(item.faltam)}` : 'Valor restante oculto'}</p>
                  {item.dataFim && (
                    <p className="mt-0.5 text-xs text-subtle">Meta: {formatMonthYear(item.dataFim)}</p>
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
