import { Link } from 'react-router-dom';
import { ArrowUpRight, PiggyBank } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { formatCurrency } from '../../utils/validation';
import { getGoalIcon, getGoalProgress, getGoalProgressColorClassName, getGoalStatusBadge } from '../../utils/goals';
import type { GoalViewModel } from '../../types/goals.types';

const COVERS = ['from-blue-500/20 via-sky-400/10 to-indigo-500/15', 'from-teal-500/20 via-cyan-400/10 to-blue-500/15', 'from-purple/20 via-indigo-400/10 to-blue-500/15'];
export function GoalListCard({ goal, valuesVisible = true }: { goal: GoalViewModel; valuesVisible?: boolean }) {
  const Icon = getGoalIcon(goal.titulo);
  const progress = getGoalProgress(goal);
  const badge = getGoalStatusBadge(goal.status);
  const active = goal.status !== 'cancelada' && goal.status !== 'concluida';
  return <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-accent/50">
    <Link to={'/goals/' + goal.id} aria-label={'Ver meta ' + goal.titulo} className={'relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br ' + COVERS[goal.id % COVERS.length]}>
      <span aria-hidden="true" className="absolute -right-5 -top-8 h-36 w-36 rounded-full border-[18px] border-white/15" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-surface/70 bg-surface/85 text-accent-ink shadow-sm"><Icon size={32} aria-hidden="true" /></span>
      <ArrowUpRight size={19} aria-hidden="true" className="absolute right-4 top-4 text-accent-ink" />
    </Link>
    <div className="flex flex-1 flex-col p-5">
      <div><Badge label={badge.label} variant={badge.variant} /></div>
      <h3 className="mt-3 break-words text-lg font-bold text-foreground"><Link to={'/goals/' + goal.id} className="hover:text-accent-ink">{goal.titulo}</Link></h3>
      <p className="mt-4 text-xs text-muted">Valor guardado</p>
      <p className="mt-1 break-words text-2xl font-bold tabular-nums text-foreground">{valuesVisible ? formatCurrency(goal.valorAtual) : 'R$ ••••••'}</p>
      <p className="mt-1 text-xs text-muted">{valuesVisible ? 'de ' + formatCurrency(goal.valorObjetivo) : 'Objetivo oculto'}</p>
      {valuesVisible ? <div className="mt-4"><ProgressBar value={progress} colorClassName={getGoalProgressColorClassName(goal.status)} /><p className="mt-2 text-xs font-medium text-muted">{progress}% do objetivo</p></div> : <p className="mt-4 text-xs text-muted">Progresso oculto</p>}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link to={'/goals/' + goal.id} className={'flex min-h-11 items-center justify-center rounded-xl border border-line-strong px-2 text-sm font-semibold text-secondary hover:bg-elevated ' + (active ? '' : 'col-span-2')}>Ver meta</Link>
        {active && <Link to={'/goals/' + goal.id + '?guardar=1'} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-accent px-2 text-sm font-semibold text-on-accent hover:bg-accent-hover"><PiggyBank size={16} aria-hidden="true" />Guardar valor</Link>}
      </div>
    </div>
  </article>;
}
