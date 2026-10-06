import type { ReportEvolutionPoint } from '../../types/reports.types';
import { formatCurrency } from '../../utils/validation';
const WIDTH = 900, HEIGHT = 300, LEFT = 76, RIGHT = 35, TOP = 18, BOTTOM = 40;
const SERIES = [{ key: 'receitas', label: 'Receitas', color: '#2dd4bf' }, { key: 'despesas', label: 'Despesas', color: '#f87171' }, { key: 'saldo', label: 'Saldo', color: '#38bdf8' }] as const;
export function FinancialEvolutionChart({ data, periodLabel }: { data: ReportEvolutionPoint[]; periodLabel: string }) {
  const values = data.flatMap((item) => [item.receitas, item.despesas, item.saldo]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const margin = (maximum - minimum) * 0.1;
  const low = minimum < 0 ? minimum - margin : 0;
  const high = maximum + margin;
  const y = (value: number) => TOP + (high - value) / (high - low) * (HEIGHT - TOP - BOTTOM);
  const x = (index: number) => data.length <= 1 ? (LEFT + WIDTH - RIGHT) / 2 : LEFT + index / (data.length - 1) * (WIDTH - LEFT - RIGHT);
  const ticks = Array.from({ length: 5 }, (_, index) => low + index / 4 * (high - low));
  const hasData = values.some((value) => value !== 0);
  return <div className="rounded-2xl border border-[#202634] bg-[#121827] p-5 sm:p-6">
    <h2 className="text-base font-semibold text-white">Receitas, despesas e saldo</h2><p className="mt-1 text-xs text-slate-400">{periodLabel} · Valores em R$</p>
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">{SERIES.map((serie) => <span key={serie.key} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: serie.color }} />{serie.label}</span>)}</div>
    {hasData ? <svg role="img" aria-label="Evolução mensal de receitas, despesas e saldo" viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT} className="mt-4 w-full">
      {ticks.map((tick, index) => <g key={index}><line x1={LEFT} x2={WIDTH - RIGHT} y1={y(tick)} y2={y(tick)} stroke="#202634" strokeDasharray="3 4" /><text x={LEFT-8} y={y(tick)+4} textAnchor="end" fontSize={11} fill="#94a3b8">{tick.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })}</text></g>)}
      <line x1={LEFT} x2={WIDTH-RIGHT} y1={y(0)} y2={y(0)} stroke="#64748b" />
      {SERIES.map((serie) => <g key={serie.key}><polyline fill="none" stroke={serie.color} strokeWidth={2} points={data.map((item,index) => x(index)+','+y(item[serie.key])).join(' ')} />{data.map((item,index) => <circle key={item.mes} cx={x(index)} cy={y(item[serie.key])} r={3.5} fill={serie.color}><title>{item.mes + ' · ' + serie.label + ': ' + formatCurrency(item[serie.key])}</title></circle>)}</g>)}
      {data.map((item,index) => index % Math.max(1,Math.ceil(data.length/12)) === 0 || index === data.length-1 ? <text key={item.mes} x={x(index)} y={HEIGHT-12} textAnchor="middle" fontSize={11} fill="#94a3b8">{item.mes}</text> : null)}
    </svg> : <p className="flex h-56 items-center justify-center text-sm text-slate-500">Sem movimentações confirmadas no período.</p>}
  </div>;
}
