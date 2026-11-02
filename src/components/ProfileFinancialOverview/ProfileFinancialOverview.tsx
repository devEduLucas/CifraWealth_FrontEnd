import { useEffect, useState } from 'react';
import { ArrowUpRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type GoalResponse } from '../../lib/api';
import type { DetailedReportResponse } from '../../types/reports.types';
import { localDateOnly } from '../../utils/reports';
import { formatCurrency } from '../../utils/validation';
import { useFinancialPrivacy } from '../../hooks/useFinancialPrivacy';
import { FinancialPrivacyButton } from '../FinancialPrivacyButton/FinancialPrivacyButton';
import { CashFlowComparison } from '../CashFlowComparison/CashFlowComparison';

export function ProfileFinancialOverview() {
  const { valuesVisible } = useFinancialPrivacy();
  const [report, setReport] = useState<DetailedReportResponse | null>(null);
  const [goals, setGoals] = useState<GoalResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [retry, setRetry] = useState(0);
  const today = localDateOnly();
  const start = today.slice(0, 7) + '-01';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErrors([]);
    Promise.allSettled([
      api.getDetailedReport(start, today, controller.signal),
      api.listGoals(),
    ]).then(([monthly, targets]) => {
      if (controller.signal.aborted) return;
      setReport(monthly.status === 'fulfilled' ? monthly.value : null);
      setGoals(targets.status === 'fulfilled' ? targets.value : null);
      setErrors([
        ...(monthly.status === 'rejected' ? ['O resumo do mês está indisponível.'] : []),
        ...(targets.status === 'rejected' ? ['As metas estão indisponíveis.'] : []),
      ]);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [retry, start, today]);

  const activeGoals = goals?.filter((goal) => goal.status === 'em_andamento') ?? [];
  const saved = activeGoals.reduce((total, goal) => total + Math.round(goal.valor_atual * 100), 0) / 100;
  const month = new Date(today + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const amount = (value: number) => valuesVisible ? formatCurrency(value) : 'R$ ••••••';

  return (
    <section id="profile-financial" aria-labelledby="profile-financial-title" className="mt-5 scroll-mt-24 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="profile-financial-title" className="text-base font-bold text-foreground">Seu momento financeiro</h2>
          <p className="mt-1 text-sm capitalize text-muted" title="Transações confirmadas do início do mês até hoje">{month}</p>
        </div>
        <FinancialPrivacyButton />
      </div>
      {loading ? <p role="status" className="mt-4 text-sm text-muted">Carregando seu resumo financeiro...</p> : <>
        {errors.length > 0 && <div role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-foreground"><p>{errors.join(' ')}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="min-h-11 font-semibold text-accent-ink underline">Tentar novamente</button></div>}
        {report && <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="finance-hero min-w-0 rounded-2xl p-5 sm:p-6"><p className="hero-muted text-sm font-medium">Resultado do mês</p><p className={'mt-2 break-words text-3xl font-bold tabular-nums tracking-tight sm:text-4xl ' + (valuesVisible && report.summary.saldo < 0 ? 'hero-negative' : 'hero-ink')}>{amount(report.summary.saldo)}</p><Link to={`/reports?inicio=${start}&fim=${today}`} className="hero-glass hero-ink mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold">Analisar relatório do mês<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
          <CashFlowComparison income={report.summary.receitas} expense={report.summary.despesas} valuesVisible={valuesVisible} showResult={false} />
        </div>}
        {!valuesVisible && <p className="mt-3 text-xs text-muted">Valores e indicadores ocultos.</p>}
        {report && report.transactions.length === 0 && <Link to="/transactions?new=1" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">Registrar primeira movimentação<ArrowUpRight size={16} aria-hidden="true" /></Link>}
        {goals && <Link to={activeGoals.length > 0 ? '/goals' : '/goals?new=1'} data-tone="progress" className="finance-tint mt-5 flex min-w-0 items-center gap-3 rounded-xl p-4 text-foreground transition-shadow"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-progress/15 text-progress"><Target size={22} aria-hidden="true" /></span><span className="min-w-0 flex-1">{activeGoals.length > 0 ? <><span className="block text-sm text-muted">Guardado nas metas</span><span className="mt-0.5 block break-words text-xl font-bold tabular-nums">{amount(saved)}</span><span className="sr-only">{activeGoals.length} {activeGoals.length === 1 ? 'meta em andamento' : 'metas em andamento'}</span></> : <span className="text-sm font-semibold">Criar minha próxima meta</span>}</span><ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-accent-ink" /></Link>}
      </>}
    </section>
  );
}
