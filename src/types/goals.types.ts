import type { LucideIcon } from 'lucide-react';

export type GoalDisplayStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada';

export type GoalFilter = 'todas' | 'em_andamento' | 'concluidas';

export interface GoalViewModel {
  id: number;
  titulo: string;
  descricao: string | null;
  valorAtual: number;
  valorObjetivo: number;
  status: GoalDisplayStatus;
  dataFim: string | null;
}

export interface GoalFormValues {
  titulo: string;
  descricao: string;
  valorObjetivo: string;
  dataFim: string;
}

export interface AchievementItem {
  id: number;
  titulo: string;
  icon: LucideIcon;
  faltam: number;
  dataFim: string | null;
}
