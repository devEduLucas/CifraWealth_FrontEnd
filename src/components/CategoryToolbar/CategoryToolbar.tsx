import { useId } from 'react';
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, ChevronDown, Tags } from 'lucide-react';
import type { CategoryType } from '../../lib/api';

interface Props {
  view: 'usage' | 'manage';
  type: CategoryType;
  periodLabel: string;
  currentMonth: boolean;
  periodOpen: boolean;
  disabled: boolean;
  onViewChange: (view: 'usage' | 'manage') => void;
  onTypeChange: (type: CategoryType) => void;
  onPeriodOpen: () => void;
}

export function CategoryToolbar({ view, type, periodLabel, currentMonth, periodOpen, disabled, onViewChange, onTypeChange, onPeriodOpen }: Props) {
  const typeId = useId();
  const TypeIcon = type === 'despesa' ? ArrowUpRight : ArrowDownLeft;
  return <div className="mb-5 flex min-w-0 flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
    <div role="group" aria-label="Visualização das categorias" className="flex min-w-0 gap-5 border-b border-line lg:gap-6 lg:border-0">
      {([{ value: 'usage', label: 'Análise', icon: BarChart3 }, { value: 'manage', label: 'Minhas categorias', icon: Tags }] as const).map(({ value, label, icon: Icon }) => (
        <button key={value} type="button" aria-pressed={view === value} onClick={() => onViewChange(value)}
          className={'-mb-px inline-flex min-h-12 items-center justify-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors ' + (view === value ? 'border-accent text-accent-ink' : 'border-transparent text-muted hover:border-line-strong hover:text-foreground')}>
          <Icon size={17} aria-hidden="true" className="shrink-0" />{label}
        </button>
      ))}
    </div>
    <div className="grid min-w-0 grid-cols-2 items-center gap-3 lg:flex lg:shrink-0">
      <div className="min-w-0">
        <label htmlFor={typeId} className="sr-only">Tipo das categorias</label>
        <div className="field-shell h-11 lg:w-40">
          <TypeIcon size={17} aria-hidden="true" className={'pointer-events-none absolute left-3 ' + (type === 'despesa' ? 'text-danger' : 'text-positive')} />
          <select id={typeId} value={type} disabled={disabled} onChange={(event) => onTypeChange(event.target.value as CategoryType)} className="appearance-none pl-10 pr-8 text-sm font-semibold text-foreground disabled:opacity-50">
            <option value="despesa">Despesas</option><option value="receita">Receitas</option>
          </select>
          <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-3 text-muted" />
        </div>
      </div>
      <button type="button" aria-label="Alterar período das categorias" aria-haspopup="dialog" aria-expanded={periodOpen} disabled={disabled} title={'Período: ' + periodLabel} onClick={onPeriodOpen}
        className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold text-secondary transition-colors hover:bg-elevated disabled:opacity-50">
        <CalendarDays size={17} aria-hidden="true" className="shrink-0 text-muted" />{currentMonth ? 'Este mês' : 'Período'}<ChevronDown size={14} aria-hidden="true" className="shrink-0 text-muted" />
      </button>
    </div>
  </div>;
}
