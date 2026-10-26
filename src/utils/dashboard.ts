import type { MonthlyReportItem } from '../lib/api';

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Compare the same number of elapsed calendar days, including shorter months. */
export function dashboardPeriods(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const previous = new Date(year, month, 0);
  const comparisonDays = Math.min(today.getDate(), previous.getDate());
  return {
    currentMonth: dateKey(year, month, 1).slice(0, 7),
    previousMonth: dateKey(previous.getFullYear(), previous.getMonth(), 1).slice(0, 7),
    previousYear: previous.getFullYear(),
    currentComparisonEnd: dateKey(year, month, comparisonDays),
    previousComparisonEnd: dateKey(previous.getFullYear(), previous.getMonth(), comparisonDays),
    comparisonDays,
  };
}

export function expenseComparison(
  current: MonthlyReportItem | undefined,
  previous: MonthlyReportItem | undefined,
  days: number,
) {
  if (!current || !previous || previous.total_despesas <= 0) return null;
  const variation = Math.round(((current.total_despesas - previous.total_despesas) / previous.total_despesas) * 100);
  return {
    text: variation === 0
      ? `Sem variação em relação ao mês anterior · dias 1 a ${days}`
      : `${Math.abs(variation)}% ${variation < 0 ? 'menos' : 'mais'} que no mês anterior · dias 1 a ${days}`,
    tone: variation < 0 ? 'text-positive' : variation > 0 ? 'text-danger' : 'text-muted',
  };
}
