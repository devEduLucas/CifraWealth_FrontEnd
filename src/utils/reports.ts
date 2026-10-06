import type { DetailedReportResponse, ReportPeriod } from '../types/reports.types';
export function localDateOnly(value = new Date()): string {
  return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'), String(value.getDate()).padStart(2, '0')].join('-');
}
export function presetReportRange(period: Exclude<ReportPeriod, 'custom'>, now = new Date()) {
  const months = Number(period.replace('m', ''));
  return { start: localDateOnly(new Date(now.getFullYear(), now.getMonth() - months + 1, 1)), end: localDateOnly(now) };
}
export function validateReportRange(start: string, end: string): string | null {
  if (!start || !end) return 'Informe as duas datas.';
  for (const date of [start, end]) {
    const parsed = new Date(date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date) return 'Informe datas válidas.';
  }
  if (start > end) return 'A data inicial deve ser igual ou anterior à data final.';
  if (new Date(end).getTime() - new Date(start).getTime() > 366 * 5 * 86400000) return 'Selecione um período de até cinco anos.';
  return null;
}
export function formatReportDate(date: string): string { return date.split('-').reverse().join('/'); }
function cell(value: string | number): string {
  const text = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : (/^[=+\-@\t\r\n]/.test(value) ? "'" + value : value);
  return '"' + text.replace(/"/g, '""') + '"';
}
export function reportCsv(report: DetailedReportResponse): string {
  const rows: Array<Array<string | number>> = [
    ['Relatório financeiro', formatReportDate(report.dataInicio), formatReportDate(report.dataFim)],
    ['Somente transações confirmadas. Metas mostram a situação atual.'], [],
    ['Resumo', 'Valor'], ['Receitas', report.summary.receitas], ['Despesas', report.summary.despesas], ['Saldo', report.summary.saldo], ['Taxa de economia (%)', report.summary.taxaEconomiaPercentual], [],
    ['Mês', 'Receitas', 'Despesas', 'Saldo'], ...report.history.map((item) => [item.periodo, item.receitas, item.despesas, item.saldo]), [],
    ['Categoria de despesa', 'Total', 'Percentual'], ...report.categoryBreakdown.map((item) => [item.nome, item.total, item.percentual]), [],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'], ...report.transactions.map((item) => [formatReportDate(item.data), item.descricao, item.categoria, item.tipo, item.valor]), [],
    ['Meta (situação atual)', 'Valor guardado', 'Objetivo'], ...report.goals.map((item) => [item.nome, item.valorAtual, item.valorAlvo]),
  ];
  return '\ufeff' + rows.map((row) => row.map(cell).join(';')).join('\r\n');
}
export function downloadReport(report: DetailedReportResponse): void {
  const url = URL.createObjectURL(new Blob([reportCsv(report)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = 'relatorio-' + report.dataInicio + '-a-' + report.dataFim + '.csv';
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
