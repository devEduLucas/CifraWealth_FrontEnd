import {
  House,
  Laptop,
  LineChart,
  Plane,
  Shield,
  Smartphone,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { GoalResponse } from '../lib/api';
import type { BadgeVariant } from '../components/Badge/Badge';
import type { GoalDisplayStatus, GoalViewModel } from '../types/goals.types';

const KEYWORD_ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['reserva', 'emergencia', 'emergência'], icon: Shield },
  { keywords: ['viagem', 'viajar'], icon: Plane },
  { keywords: ['notebook', 'laptop'], icon: Laptop },
  { keywords: ['celular', 'iphone', 'smartphone'], icon: Smartphone },
  { keywords: ['investim'], icon: LineChart },
  { keywords: ['apartamento', 'casa', 'imovel', 'imóvel'], icon: House },
  { keywords: ['carteira'], icon: Wallet },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getGoalIcon(titulo: string): LucideIcon {
  const normalized = normalize(titulo);
  const match = KEYWORD_ICONS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(normalize(keyword)))
  );
  return match?.icon ?? Target;
}

function deriveDisplayStatus(goal: GoalResponse): GoalDisplayStatus {
  if (goal.status !== 'em_andamento') return goal.status;

  if (goal.data_fim) {
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const prazoVencido = goal.data_fim < today;
    if (prazoVencido && goal.valor_atual < goal.valor_objetivo) return 'atrasada';
  }

  return 'em_andamento';
}

export function toGoalViewModel(goal: GoalResponse): GoalViewModel {
  return {
    id: goal.id_meta,
    titulo: goal.titulo,
    descricao: goal.descricao,
    valorAtual: goal.valor_atual,
    valorObjetivo: goal.valor_objetivo,
    status: deriveDisplayStatus(goal),
    dataFim: goal.data_fim,
  };
}

export function getGoalProgress(goal: { valorAtual: number; valorObjetivo: number }): number {
  return goal.valorObjetivo > 0 ? Math.min(Math.max(Math.floor((goal.valorAtual / goal.valorObjetivo) * 100), 0), 100) : 0;
}

export function getGoalStatusBadge(status: GoalDisplayStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case 'concluida':
      return { label: 'Concluída', variant: 'sky' };
    case 'atrasada':
      return { label: 'Atrasada', variant: 'red' };
    case 'cancelada':
      return { label: 'Cancelada', variant: 'slate' };
    case 'em_andamento':
    default:
      return { label: 'Em andamento', variant: 'teal' };
  }
}

export function getGoalProgressColorClassName(status: GoalDisplayStatus): string {
  if (status === 'atrasada') return 'bg-red-400';
  if (status === 'cancelada') return 'bg-slate-500';
  return 'bg-teal-400';
}

export function formatMonthYear(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
