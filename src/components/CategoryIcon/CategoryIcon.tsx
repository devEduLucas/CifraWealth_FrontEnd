import type { CategoryType } from '../../lib/api';
import {
  CATEGORY_ICONS,
  categoryColor,
  categoryIconKey,
} from '../../utils/categoryAppearance';

export function CategoryIcon({
  icon,
  color,
  type,
  className = '',
}: {
  icon?: string | null;
  color?: string | null;
  type: CategoryType;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS.find(
    (item) => item.value === categoryIconKey(icon),
  )!.icon;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-foreground ${className}`}
      style={{ backgroundColor: categoryColor(color, type) + '1a' }}
    >
      <Icon size={21} />
    </span>
  );
}
