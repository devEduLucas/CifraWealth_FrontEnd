import { useId } from 'react';
import type { ReportEvolutionPoint } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';
import { useChartWidth } from '../../hooks/useChartWidth';

const HEIGHT = 280, LEFT = 56, RIGHT = 18, TOP = 18, BOTTOM = 36;
const SERIES = [
  { key: 'receitas', label: 'Receitas', color: 'var(--chart-income)', dash: '' },
  { key: 'despesas', label: 'Despesas', color: 'var(--chart-expense)', dash: '6 4' },
  { key: 'saldo', label: 'Saldo', color: 'var(--chart-balance)', dash: '2 4' },
] as const;

export function FinancialEvolutionChart({ data, periodLabel }: { data: ReportEvolutionPoint[]; periodLabel: string }) {
  const { ref, width } = useChartWidth();
  const titleId = useId();
  const descriptionId = useId();
  const tableId = useId();
  const singleMonth = data.length === 1;
  const values = data.flatMap((item) => [item.receitas, item.despesas, item.saldo]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const margin = (maximum - minimum) * 0.1;
  const low = minimum < 0 ? minimum - margin : 0;
  const high = maximum + margin;
  const y = (value: number) => TOP + (high - value) / (high - low) * (HEIGHT - TOP - BOTTOM);
  const x = (index: number) => data.length <= 1 ? (LEFT + width - RIGHT) / 2 : LEFT + index / (data.length - 1) * (width - LEFT - RIGHT);
  const ticks = Array.from({ length: 5 }, (_, index) => low + index / 4 * (high - low));
  const hasData = values.some((value) => value !== 0);
  const labelStep = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(width / 85))));

  return <section ref={ref} aria-labelledby={titleId} className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <h2 id={titleId} className="text-base font-semibold text-foreground">Receitas, despesas e saldo</h2>
    <p className="mt-1 text-xs text-muted">{periodLabel} · Valores em R$</p>
    <p id={descriptionId} className="mt-2 text-xs leading-5 text-muted">
      {singleMonth ? 'Um mês selecionado: compare os totais nas barras. Selecione mais meses para acompanhar a evolução.' : 'Cada ponto representa o total do mês dentro do período escolhido. O saldo de cada mês é a diferença entre suas receitas e despesas.'}
    </p>
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">{SERIES.map((serie) => <span key={serie.key} className="flex items-center gap-1.5"><svg aria-hidden="true" viewBox="0 0 24 8" className="h-2 w-6"><line x1="0" y1="4" x2="24" y2="4" stroke={serie.color} strokeWidth="2" strokeDasharray={singleMonth ? undefined : serie.dash} /></svg>{serie.label}</span>)}</div>
    {hasData ? <svg role="img" aria-label="Evolução mensal de receitas, despesas e saldo" aria-describedby={descriptionId} viewBox={'0 0 ' + width + ' ' + HEIGHT} className="mt-4 w-full">
      {ticks.map((tick, index) => <g key={index}><line x1={LEFT} x2={width - RIGHT} y1={y(tick)} y2={y(tick)} stroke="var(--chart-grid)" strokeDasharray="3 4" /><text x={LEFT - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="var(--chart-label)">{tick.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })}</text></g>)}
      <line x1={LEFT} x2={width - RIGHT} y1={y(0)} y2={y(0)} stroke="var(--chart-label)" />
      {singleMonth ? SERIES.map((serie, index) => {
        const value = data[0][serie.key];
        const slot = (width - LEFT - RIGHT) / 3;
        const center = LEFT + slot * (index + 0.5);
        const barWidth = Math.min(40, slot * 0.6);
        return <g key={serie.key} data-series={serie.key}><rect x={center - barWidth / 2} y={Math.min(y(value), y(0))} width={barWidth} height={Math.max(1, Math.abs(y(value) - y(0)))} rx={3} fill={serie.color}><title>{serie.label + ': ' + formatCurrency(value)}</title></rect><text x={center} y={HEIGHT - 12} textAnchor="middle" fontSize={10} fill="var(--chart-label)">{serie.label}</text></g>;
      }) : <>
        {SERIES.map((serie) => <g key={serie.key} data-series={serie.key}><polyline fill="none" stroke={serie.color} strokeWidth={2} strokeDasharray={serie.dash} points={data.map((item, index) => x(index) + ',' + y(item[serie.key])).join(' ')} />{data.map((item, index) => <circle key={index} cx={x(index)} cy={y(item[serie.key])} r={3.5} fill={serie.color}><title>{item.mes + ' · ' + serie.label + ': ' + formatCurrency(item[serie.key])}</title></circle>)}</g>)}
        {data.map((item, index) => index % labelStep === 0 || index === data.length - 1 ? <text key={index} x={x(index)} y={HEIGHT - 12} textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'} fontSize={11} fill="var(--chart-label)">{item.mes}</text> : null)}
      </>}
    </svg> : <p className="flex h-48 items-center justify-center text-center text-sm text-subtle">Sem movimentações confirmadas no período.</p>}
    {singleMonth && hasData && <dl className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-elevated p-3 text-xs sm:grid-cols-3">{SERIES.map((serie) => <div key={serie.key} className="flex flex-wrap justify-between gap-2 sm:block"><dt className="text-muted">{serie.label}</dt><dd className="font-semibold tabular-nums text-foreground sm:mt-1">{formatCurrency(data[0][serie.key])}</dd></div>)}</dl>}
    <details className="mt-4 rounded-xl border border-line px-3 py-2">
      <summary className="min-h-8 cursor-pointer py-1 text-sm font-semibold text-secondary">Ver valores do gráfico</summary>
      <p className="mt-2 text-xs leading-5 text-muted sm:hidden">Deslize a tabela para consultar todas as colunas.</p>
      <div role="region" tabIndex={0} aria-labelledby={tableId} className="mt-3 overflow-x-auto rounded-lg">
        <table className="w-full min-w-[360px] text-left text-xs">
          <caption id={tableId} className="mb-2 text-left text-muted">Valores mensais no período selecionado</caption>
          <thead><tr><th scope="col" className="p-2">Mês</th>{SERIES.map((serie) => <th key={serie.key} scope="col" className="p-2 text-right">{serie.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">{data.map((item, index) => <tr key={index}><th scope="row" className="p-2 font-medium">{item.mes}</th>{SERIES.map((serie) => <td key={serie.key} className="p-2 text-right tabular-nums">{formatCurrency(item[serie.key])}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  </section>;
}
