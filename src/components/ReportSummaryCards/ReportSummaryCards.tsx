import { PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { SummaryCard } from '../SummaryCard/SummaryCard';
import { formatCurrency } from '../../utils/validation';
import type { ReportSummary } from '../../types/reports.types';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  valuesVisible?: boolean;
}

function formatVariation(value: number | null, lowerIsBetter = false): { text: string; className: string } {
  if (value === null) {
    return { text: 'Sem base no período anterior.', className: 'text-subtle' };
  }
  const arrow = value >= 0 ? '↑' : '↓';
  const className = (lowerIsBetter ? value <= 0 : value >= 0) ? 'text-positive' : 'text-danger';
  return { text: `${arrow} ${Math.abs(value)}% vs período anterior`, className };
}

export function ReportSummaryCards({ summary, valuesVisible = true }: ReportSummaryCardsProps) {
  const receitas = formatVariation(summary.variacaoReceitas);
  const despesas = formatVariation(summary.variacaoDespesas, true);
  const saldo = formatVariation(summary.variacaoSaldo);
  const taxa = formatVariation(summary.variacaoTaxaEconomia);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Receitas"
        value={valuesVisible ? formatCurrency(summary.receitas) : 'R$ ••••••'}
        icon={TrendingUp}
        iconClassName="bg-positive/10 text-positive"
        footnote={valuesVisible ? receitas.text : 'Variação oculta'}
        footnoteClassName={valuesVisible ? receitas.className : 'text-subtle'}
      />
      <SummaryCard
        label="Despesas"
        value={valuesVisible ? formatCurrency(summary.despesas) : 'R$ ••••••'}
        icon={TrendingDown}
        iconClassName="bg-danger/15 text-danger"
        footnote={valuesVisible ? despesas.text : 'Variação oculta'}
        footnoteClassName={valuesVisible ? despesas.className : 'text-subtle'}
      />
      <SummaryCard
        label="Saldo do Período"
        value={valuesVisible ? formatCurrency(summary.saldo) : 'R$ ••••••'}
        icon={Wallet}
        iconClassName="bg-info/15 text-info"
        footnote={valuesVisible ? saldo.text : 'Variação oculta'}
        footnoteClassName={valuesVisible ? saldo.className : 'text-subtle'}
      />
      <SummaryCard
        label="Taxa de Economia"
        value={valuesVisible ? `${summary.taxaEconomiaPercentual}%` : '•••%'}
        icon={PieChart}
        iconClassName="bg-positive/10 text-positive"
        footnote={valuesVisible ? taxa.text : 'Variação oculta'}
        footnoteClassName={valuesVisible ? taxa.className : 'text-subtle'}
      />
    </div>
  );
}
