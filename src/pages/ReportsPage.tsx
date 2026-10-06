import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { session } from '../lib/session';
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
  const user = session.getUser();
  const fullName = user ? (user.nome + ' ' + (user.sobrenome ?? '')).trim() : 'Usuário';
  const [period, setPeriod] = useState<ReportPeriod>('6m');
  const [range, setRange] = useState(() => presetReportRange('6m'));
  const [draft, setDraft] = useState(range);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DetailedReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null); setReport(null);
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
    const first = id + '-01';
    const date = new Date(first + 'T00:00:00Z');
    const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).toISOString().slice(0,10);
    const updated = { start: first < range.start ? range.start : first, end: last > range.end ? range.end : last };
    setPeriod('custom'); setFilterError(null); setRange(updated); setDraft(updated);
  }
  const label = formatReportDate(range.start) + ' a ' + formatReportDate(range.end);
  return (
    <DashboardLayout userName={fullName}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Relatórios</h1><p className="mt-1 text-sm text-slate-400">Acompanhe receitas, despesas e saldo a partir das suas transações confirmadas.</p></div>
        <div className="flex flex-wrap items-center gap-3"><ReportPeriodFilter value={period} onChange={changePeriod} /><ReportExportButton onExport={report && !loading ? () => downloadReport(report) : undefined} /></div>
      </div>
      {period === 'custom' && (
        <form onSubmit={applyDates} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-[#202634] bg-[#121827] p-4">
          <div><label htmlFor="report-start" className="mb-1 block text-xs text-slate-400">Data inicial</label><input id="report-start" type="date" required value={draft.start} onChange={(event) => setDraft((old) => ({ ...old, start: event.target.value }))} className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-3 text-sm text-white" /></div>
          <div><label htmlFor="report-end" className="mb-1 block text-xs text-slate-400">Data final</label><input id="report-end" type="date" required value={draft.end} onChange={(event) => setDraft((old) => ({ ...old, end: event.target.value }))} className="h-11 rounded-xl border border-[#262F40] bg-[#161F32] px-3 text-sm text-white" /></div>
          <button type="submit" className="h-11 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-slate-950">Aplicar datas</button>
          {filterError && <p role="alert" className="w-full text-sm text-red-400">{filterError}</p>}
        </form>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-400">Período aplicado: {label} · Comparação com o período anterior de mesma duração.</p><button type="button" disabled={loading} onClick={() => setRetry((value) => value + 1)} className="text-sm font-semibold text-teal-400 disabled:opacity-40">Atualizar relatório</button></div>
      {loading && <p role="status" className="mt-8 text-sm text-slate-400">Carregando relatório...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 font-semibold underline">Tentar novamente</button></div>}
      {report && !loading && !error && <>
        {report.transactions.length === 0 && <div className="mt-6 rounded-xl border border-[#202634] p-4 text-sm text-slate-400">Nenhuma transação confirmada neste período. <Link to="/transactions" className="font-semibold text-teal-400">Registrar transação</Link> ou selecione outras datas.</div>}
        <div className="mt-6"><ReportSummaryCards summary={report.summary} /></div>
        <div className="mt-6"><FinancialEvolutionChart data={report.evolution} periodLabel={label} /></div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><CategoryBreakdownChart data={report.categoryBreakdown} total={report.summary.despesas} /><MonthlyComparisonChart data={report.monthlyComparison} /></div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><ReportInsightsPanel insights={report.insights} /><ReportGoalsPanel goals={report.goals} /></div>
        <div className="mt-6"><ReportsHistoryTable items={report.history} onView={viewMonth} /></div>
        <div className="mt-6"><ReportTransactionsTable key={report.dataInicio + report.dataFim} items={report.transactions} /></div>
      </>}
    </DashboardLayout>
  );
}
