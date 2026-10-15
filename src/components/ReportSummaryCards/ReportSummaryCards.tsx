import { PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { SummaryCard } from '../SummaryCard/SummaryCard';
import { formatCurrency } from '../../utils/validation';
import type { ReportSummary } from '../../types/reports.types';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

function formatVariation(value: number | null, lowerIsBetter = false): { text: string; className: string } {
  if (value === null) {
    return { text: 'Sem base no período anterior.', className: 'text-subtle' };
  }
  const arrow = value >= 0 ? '↑' : '↓';
  const className = (lowerIsBetter ? value <= 0 : value >= 0) ? 'text-accent' : 'text-danger';
  return { text: `${arrow} ${Math.abs(value)}% vs período anterior`, className };
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const receitas = formatVariation(summary.variacaoReceitas);
  const despesas = formatVariation(summary.variacaoDespesas, true);
  const saldo = formatVariation(summary.variacaoSaldo);
  const taxa = formatVariation(summary.variacaoTaxaEconomia);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Receitas"
        value={formatCurrency(summary.receitas)}
        icon={TrendingUp}
        iconClassName="bg-teal-500/15 text-accent"
        footnote={receitas.text}
        footnoteClassName={receitas.className}
      />
      <SummaryCard
        label="Despesas"
        value={formatCurrency(summary.despesas)}
        icon={TrendingDown}
        iconClassName="bg-red-500/15 text-danger"
        footnote={despesas.text}
        footnoteClassName={despesas.className}
      />
      <SummaryCard
        label="Saldo do Período"
        value={formatCurrency(summary.saldo)}
        icon={Wallet}
        iconClassName="bg-sky-500/15 text-info"
        footnote={saldo.text}
        footnoteClassName={saldo.className}
      />
      <SummaryCard
        label="Taxa de Economia"
        value={`${summary.taxaEconomiaPercentual}%`}
        icon={PieChart}
        iconClassName="bg-teal-500/15 text-accent"
        footnote={taxa.text}
        footnoteClassName={taxa.className}
      />
    </div>
  );
}
