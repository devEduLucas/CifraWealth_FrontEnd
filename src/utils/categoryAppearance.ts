import {
  Briefcase,
  Car,
  ChartNoAxesCombined,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  ShoppingBag,
  Tag,
  Utensils,
  Wallet,
} from 'lucide-react';
import type { CategoryType } from '../lib/api';

export const CATEGORY_ICONS = [
  { value: 'tag', label: 'Etiqueta', icon: Tag },
  { value: 'wallet', label: 'Carteira', icon: Wallet },
  { value: 'briefcase', label: 'Trabalho', icon: Briefcase },
  { value: 'chart-line', label: 'Investimentos', icon: ChartNoAxesCombined },
  { value: 'utensils', label: 'Alimentação', icon: Utensils },
  { value: 'car', label: 'Transporte', icon: Car },
  { value: 'gamepad', label: 'Lazer', icon: Gamepad2 },
  { value: 'home', label: 'Moradia', icon: House },
  { value: 'heart-pulse', label: 'Saúde', icon: HeartPulse },
  { value: 'graduation-cap', label: 'Educação', icon: GraduationCap },
  { value: 'shopping-bag', label: 'Compras', icon: ShoppingBag },
  { value: 'plane', label: 'Viagem', icon: Plane },
] as const;

export const CATEGORY_COLORS = [
  { value: '#2563eb', label: 'Azul' },
  { value: '#0d9488', label: 'Turquesa' },
  { value: '#16a34a', label: 'Verde' },
  { value: '#ea580c', label: 'Laranja' },
  { value: '#dc2626', label: 'Vermelho' },
  { value: '#9333ea', label: 'Roxo' },
  { value: '#db2777', label: 'Rosa' },
  { value: '#64748b', label: 'Cinza' },
] as const;

export function categoryIconKey(value?: string | null) {
  const key = value?.replace(/-/g, '').toLowerCase();
  const aliases: Record<string, string> = {
    dollarsign: 'wallet',
    trendingup: 'chart-line',
    coffee: 'utensils',
    smile: 'gamepad',
    house: 'home',
  };
  return (
    CATEGORY_ICONS.find((item) => item.value.replace(/-/g, '') === key)
      ?.value ??
    aliases[key ?? ''] ??
    'tag'
  );
}

export function categoryColor(
  value: string | null | undefined,
  type: CategoryType,
) {
  if (value && /^#[a-f\d]{6}$/i.test(value)) return value.toLowerCase();
  if (value && /^#[a-f\d]{3}$/i.test(value))
    return (
      '#' +
      [...value.slice(1)]
        .map((char) => char + char)
        .join('')
        .toLowerCase()
    );
  return type === 'receita' ? '#16a34a' : '#2563eb';
}
