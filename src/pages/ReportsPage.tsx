import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useSessionUser } from '../hooks/useSessionUser';
import { isDemoMode } from '../lib/config';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { ReportPeriodFilter } from '../components/ReportPeriodFilter/ReportPeriodFilter';
import { ReportExportButton } from '../components/ReportExportButton/ReportExportButton';
import { ReportSummaryCards } from '../components/ReportSummaryCards/ReportSummaryCards';
import { FinancialEvolutionChart } from '../components/FinancialEvolutionChart/FinancialEvolutionChart';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart/CategoryBreakdownChart';
import { MonthlyComparisonChart } from '../components/MonthlyComparisonChart/MonthlyComparisonChart';
import { ReportInsightsPanel } from '../components/ReportInsightsPanel/ReportInsightsPanel';
import { ReportGoalsPanel } from '../components/ReportGoalsPanel/ReportGoalsPanel';
import { ReportsHistoryTable } from '../components/ReportsHistoryTable/ReportsHistoryTable';
import { ReportTransactionsTable } from '../components/ReportTransactionsTable/ReportTransactionsTable';
import type { DetailedReportResponse, ReportPeriod } from '../types/reports.types';
import { downloadReport, formatReportDate, presetReportRange, validateReportRange } from '../utils/reports';

export function ReportsPage() {
  const user = useSessionUser();
  const fullName = user ? (user.nome + ' ' + (user.sobrenome ?? '')).trim() : 'Usuário';
  const [period, setPeriod] = useState<ReportPeriod>('6m');
  const [range, setRange] = useState(() => presetReportRange('6m'));
  const [draft, setDraft] = useState(range);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DetailedReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportLock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null); setReport(null); setExportError(null);
    api.getDetailedReport(range.start, range.end, controller.signal).then((result) => {
      if (!controller.signal.aborted) setReport(result);
    }).catch((err: unknown) => {
      if (!controller.signal.aborted) setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o relatório. Confira a conexão com a API e tente novamente.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [range.start, range.end, retry]);
  function changePeriod(next: ReportPeriod) {
    setPeriod(next); setFilterError(null);
    if (next !== 'custom') { const updated = presetReportRange(next); setRange(updated); setDraft(updated); }
  }
  function applyDates(event: React.FormEvent) {
    event.preventDefault();
    const message = validateReportRange(draft.start, draft.end); setFilterError(message);
    if (!message) setRange({ ...draft });
  }
  function viewMonth(id: string) {
    if (exportLock.current) return;
    const first = id + '-01';
    const date = new Date(first + 'T00:00:00Z');
    const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).toISOString().slice(0,10);
    const updated = { start: first < range.start ? range.start : first, end: last > range.end ? range.end : last };
    setPeriod('custom'); setFilterError(null); setRange(updated); setDraft(updated);
  }
  async function exportPdf() {
    if (!report || loading || error || exportLock.current) return;
    exportLock.current = true;
    setExporting(true); setExportError(null);
    try {
      const { downloadReportPdf } = await import('../utils/reportPdf');
      await downloadReportPdf(report, { userName: fullName, demo: isDemoMode });
    } catch {
      setExportError('Não foi possível gerar o PDF. Confira sua conexão e tente baixar novamente.');
    } finally {
      exportLock.current = false; setExporting(false);
    }
  }
  const label = formatReportDate(range.start) + ' a ' + formatReportDate(range.end);
  return (
    <DashboardLayout userName={fullName}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">Relatórios</h1><p className="mt-1 text-sm text-muted">Acompanhe receitas, despesas e saldo a partir das suas transações confirmadas.</p></div>
        <div className="flex flex-wrap items-center gap-3"><ReportPeriodFilter value={period} onChange={changePeriod} disabled={exporting} /><ReportExportButton onExport={report && !loading && !error ? exportPdf : undefined} onExportCsv={report && !loading && !error ? () => downloadReport(report) : undefined} exporting={exporting} /></div>
      </div>
      {period === 'custom' && (
        <form onSubmit={applyDates} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4">
          <div><label htmlFor="report-start" className="mb-1 block text-xs text-muted">Data inicial</label><input id="report-start" type="date" required disabled={exporting} value={draft.start} onChange={(event) => setDraft((old) => ({ ...old, start: event.target.value }))} className="h-11 rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground" /></div>
          <div><label htmlFor="report-end" className="mb-1 block text-xs text-muted">Data final</label><input id="report-end" type="date" required disabled={exporting} value={draft.end} onChange={(event) => setDraft((old) => ({ ...old, end: event.target.value }))} className="h-11 rounded-xl border border-field-border bg-elevated px-3 text-sm text-foreground" /></div>
          <button type="submit" disabled={exporting} className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40">Aplicar datas</button>
          {filterError && <p role="alert" className="w-full text-sm text-danger">{filterError}</p>}
        </form>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted">Período aplicado: {label} · Comparação com o período anterior de mesma duração.</p><button type="button" disabled={loading || exporting} onClick={() => setRetry((value) => value + 1)} className="text-sm font-semibold text-accent-ink disabled:opacity-40">Atualizar relatório</button></div>
      {exporting && <p role="status" className="mt-4 text-sm text-muted">Preparando o PDF completo de {label}...</p>}
      {exportError && <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{exportError}</p>}
      {loading && <p role="status" className="mt-8 text-sm text-muted">Carregando relatório...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 font-semibold underline">Tentar novamente</button></div>}
      {report && !loading && !error && <>
        <a href="#transacoes-detalhadas" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink underline">Ver transações detalhadas deste período</a>
        {report.transactions.length === 0 && <div className="mt-6 rounded-xl border border-line p-4 text-sm text-muted">Nenhuma transação confirmada neste período. <Link to="/transactions" className="font-semibold text-accent-ink">Registrar transação</Link> ou selecione outras datas.</div>}
        <div className="mt-6"><ReportSummaryCards summary={report.summary} /></div>
        <div className="mt-6"><FinancialEvolutionChart data={report.evolution} periodLabel={label} /></div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><CategoryBreakdownChart data={report.categoryBreakdown} total={report.summary.despesas} /><MonthlyComparisonChart data={report.monthlyComparison} /></div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><ReportInsightsPanel insights={report.insights} /><ReportGoalsPanel goals={report.goals} /></div>
        <div className="mt-6"><ReportsHistoryTable items={report.history} onView={viewMonth} /></div>
        <div id="transacoes-detalhadas" className="mt-6 min-w-0"><ReportTransactionsTable key={report.dataInicio + report.dataFim} items={report.transactions} /></div>
      </>}
    </DashboardLayout>
  );
}
