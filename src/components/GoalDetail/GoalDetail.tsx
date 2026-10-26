import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Pencil, PiggyBank, ShieldCheck, Trash2 } from 'lucide-react';
import type { GoalViewModel } from '../../types/goals.types';
import { getGoalIcon, getGoalProgress, getGoalProgressColorClassName, getGoalStatusBadge, formatMonthYear } from '../../utils/goals';
import { formatCurrency } from '../../utils/format';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { FinancialPrivacyButton } from '../FinancialPrivacyButton/FinancialPrivacyButton';

interface Props {
  goal: GoalViewModel;
  valuesVisible: boolean;
  saving: boolean;
  onContribute: () => void;
  onEdit: () => void;
  onAdjust: () => void;
  onStatus: () => void;
  onDelete: () => void;
}

export function GoalDetail({ goal, valuesVisible, saving, onContribute, onEdit, onAdjust, onStatus, onDelete }: Props) {
  const Icon = getGoalIcon(goal.titulo);
  const badge = getGoalStatusBadge(goal.status);
  const progress = getGoalProgress(goal);
  const remaining = Math.max(0, (Math.round(goal.valorObjetivo * 100) - Math.round(goal.valorAtual * 100)) / 100);
  const active = goal.status !== 'concluida' && goal.status !== 'cancelada';
  const amount = (value: number) => valuesVisible ? formatCurrency(value) : 'R$ ••••••';

  return <>
    <div className="mb-5 flex items-center justify-between gap-3">
      <Link to="/goals" className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-accent-ink hover:underline"><ArrowLeft size={17} aria-hidden="true" />Todas as metas</Link>
      <FinancialPrivacyButton />
    </div>
    <section aria-labelledby="goal-title" className="overflow-hidden rounded-3xl border border-accent/20 bg-surface">
      <div className="relative overflow-hidden border-b border-line bg-gradient-to-br from-blue-500/15 via-sky-400/10 to-teal-500/10 p-5 sm:p-8">
        <span aria-hidden="true" className="absolute -right-14 -top-20 h-72 w-72 rounded-full border-[35px] border-accent/5" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-surface bg-surface/90 text-accent-ink shadow-sm"><Icon size={38} aria-hidden="true" /></span>
          <div className="min-w-0"><Badge label={badge.label} variant={badge.variant} /><h1 id="goal-title" className="mt-3 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{goal.titulo}</h1>{goal.descricao && <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-secondary">{goal.descricao}</p>}</div>
        </div>
      </div>
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div className="min-w-0"><p className="text-sm text-muted">Valor guardado nesta meta</p><p className="mt-2 break-words text-4xl font-bold tabular-nums tracking-tight text-foreground">{amount(goal.valorAtual)}</p><p className="mt-2 text-sm text-muted">Objetivo de <span className="font-semibold text-secondary">{amount(goal.valorObjetivo)}</span></p>
          <div className="mt-5 flex flex-wrap gap-2">{active && <Button icon={PiggyBank} disabled={saving} onClick={onContribute}>Guardar valor</Button>}<Button variant="secondary" icon={Pencil} disabled={saving} onClick={onEdit}>Editar meta</Button></div>
        </div>
        <div className="min-w-0 self-center rounded-2xl border border-line bg-elevated/50 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold text-foreground">Seu progresso</h2><span className="text-lg font-bold text-progress">{valuesVisible ? progress + '%' : 'Oculto'}</span></div>
          {valuesVisible && <ProgressBar value={progress} colorClassName={getGoalProgressColorClassName(goal.status)} />}
          <p className="mt-3 text-sm leading-6 text-muted">{goal.status === 'cancelada' ? 'Acompanhamento pausado. O valor guardado foi preservado.' : !valuesVisible ? 'Mostre os valores para consultar quanto falta para este objetivo.' : remaining === 0 ? 'Você atingiu o valor planejado para esta meta.' : <><strong className="font-semibold text-foreground">Faltam {amount(remaining)}</strong> para chegar ao seu objetivo.</>}</p>
          {goal.status === 'concluida' && <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-positive"><CheckCircle2 size={17} aria-hidden="true" />Objetivo alcançado</p>}
        </div>
      </div>
    </section>
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
      <section aria-labelledby="goal-plan-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 id="goal-plan-title" className="flex items-center gap-2 text-base font-bold text-foreground"><CalendarDays size={18} aria-hidden="true" className="text-accent-ink" />Seu plano</h2>
        <dl className="mt-4 divide-y divide-line text-sm">
          {[['Início do planejamento', goal.dataInicio ? formatMonthYear(goal.dataInicio) : 'Não informado'], ['Data planejada', goal.dataFim ? formatMonthYear(goal.dataFim) : 'Sem prazo definido'], ['Valor que deseja alcançar', amount(goal.valorObjetivo)]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 py-3"><dt className="text-muted">{label}</dt><dd className="max-w-full break-words font-semibold text-foreground">{value}</dd></div>)}
        </dl>
        {goal.status === 'atrasada' && <p className="mt-3 text-xs leading-6 text-muted">A data planejada passou. Você pode continuar guardando ou editar o prazo para acompanhar seu novo plano.</p>}
      </section>
      <section aria-labelledby="goal-reserve-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 id="goal-reserve-title" className="flex items-center gap-2 text-base font-bold text-foreground"><ShieldCheck size={18} aria-hidden="true" className="text-accent-ink" />Como funciona esta reserva</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Guarde o dinheiro na conta ou no investimento que você escolheu. Depois, registre aqui o valor separado para acompanhar seu objetivo.</p>
        <p className="mt-3 rounded-xl bg-elevated p-3 text-xs leading-6 text-secondary">A CifraWealth não transfere, investe nem gera rendimentos. Registrar um valor na meta não cria uma despesa e não desconta automaticamente do seu saldo.</p>
      </section>
    </div>
    <details className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-foreground">Gerenciar esta meta</summary>
      <div className="mt-4 grid gap-6 text-sm lg:grid-cols-3">
        {goal.status !== 'cancelada' && <div><h2 className="font-semibold text-foreground">Ajustes e retiradas</h2><p className="my-3 text-xs leading-6 text-muted">Corrija o total ou informe um valor retirado da sua reserva. A alteração afeta somente esta meta.</p><Button variant="secondary" disabled={saving} onClick={onAdjust}>Ajustar ou retirar valor guardado</Button></div>}
        <div><h2 className="font-semibold text-foreground">{goal.status === 'cancelada' ? 'Retomar seu plano' : 'Pausar acompanhamento'}</h2><p className="my-3 text-xs leading-6 text-muted">{goal.status === 'cancelada' ? 'Reative o acompanhamento mantendo os valores registrados.' : 'Cancelar preserva seus valores e permite reativar o objetivo depois.'}</p><Button variant="secondary" disabled={saving} onClick={onStatus}>{goal.status === 'cancelada' ? 'Reativar meta' : 'Cancelar meta'}</Button></div>
        <div><h2 className="font-semibold text-foreground">Excluir acompanhamento</h2><p className="my-3 text-xs leading-6 text-muted">Remove esta meta definitivamente. Nenhum dinheiro é movimentado.</p><Button variant="danger" icon={Trash2} disabled={saving} onClick={onDelete}>Excluir meta</Button></div>
      </div>
    </details>
  </>;
}
