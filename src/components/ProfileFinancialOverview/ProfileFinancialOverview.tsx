import { useEffect, useState } from 'react';
import { ArrowUpRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type GoalResponse } from '../../lib/api';
import type { DetailedReportResponse } from '../../types/reports.types';
import { localDateOnly, formatReportDate } from '../../utils/reports';
import { formatCurrency } from '../../utils/validation';
import { useFinancialPrivacy } from '../../hooks/useFinancialPrivacy';
import { FinancialPrivacyButton } from '../FinancialPrivacyButton/FinancialPrivacyButton';

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
  const saved = activeGoals.reduce((total, goal) => total + goal.valor_atual, 0);
  const amount = (value: number) => valuesVisible ? formatCurrency(value) : 'R$ ••••••';

  return (
    <section id="profile-financial" aria-labelledby="profile-financial-title" className="mt-5 scroll-mt-24 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="profile-financial-title" className="text-base font-bold text-foreground">Seu momento financeiro</h2>
          <p className="mt-1 text-xs leading-5 text-muted">De {formatReportDate(start)} a {formatReportDate(today)} · registros confirmados</p>
        </div>
        <FinancialPrivacyButton />
      </div>
      {loading ? <p role="status" className="mt-4 text-sm text-muted">Carregando seu resumo financeiro...</p> : <>
        {errors.length > 0 && <div role="alert" className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-foreground"><p>{errors.join(' ')}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="min-h-11 font-semibold text-accent-ink underline">Tentar novamente</button></div>}
        {report && <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Receitas do mês', value: report.summary.receitas, tone: 'text-positive' },
            { label: 'Despesas do mês', value: report.summary.despesas, tone: 'text-danger' },
            { label: 'Resultado do mês', value: report.summary.saldo, tone: 'text-foreground' },
          ].map(({ label, value, tone }) => <div key={label} className="min-w-0"><dt className="text-xs text-muted">{label}</dt><dd className={`mt-1 break-words text-base font-bold tabular-nums sm:text-lg ${valuesVisible ? tone : 'text-muted'}`}>{amount(value)}</dd></div>)}
        </dl>}
        {!valuesVisible && <p className="mt-3 text-xs text-muted">Valores e indicadores ocultos.</p>}
        {report && report.transactions.length === 0 && <p className="mt-3 text-sm text-muted">Seu próximo passo começa aqui: registre uma receita ou despesa para acompanhar seu mês.</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <Link to={`/reports?inicio=${start}&fim=${today}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">Analisar relatório do mês<ArrowUpRight size={16} aria-hidden="true" /></Link>
          {goals && <Link to={activeGoals.length > 0 ? '/goals' : '/goals?new=1'} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline"><Target size={16} aria-hidden="true" />{activeGoals.length > 0 ? `${activeGoals.length} ${activeGoals.length === 1 ? 'meta em andamento' : 'metas em andamento'} · ${amount(saved)} guardados` : 'Criar minha próxima meta'}</Link>}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted">Resumo dos valores informados por você. Metas mostram a situação atual.</p>
      </>}
    </section>
  );
}
