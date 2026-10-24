import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Flag,
  LockKeyhole,
  Target,
  TrendingUp,
} from 'lucide-react';
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
    ])
      .then(([monthly, targets]) => {
        if (controller.signal.aborted) return;
        setReport(monthly.status === 'fulfilled' ? monthly.value : null);
        setGoals(targets.status === 'fulfilled' ? targets.value : null);
        setErrors([
          ...(monthly.status === 'rejected'
            ? ['O resumo do mês está indisponível.']
            : []),
          ...(targets.status === 'rejected'
            ? ['As metas estão indisponíveis.']
            : []),
        ]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry, start, today]);

  const income = report?.summary.receitas ?? 0;
  const expense = report?.summary.despesas ?? 0;
  const result = income - expense;
  const hasActivity = Boolean(report?.transactions.length);
  const status = !hasActivity
    ? 'Seu próximo passo começa aqui'
    : result > 0
      ? 'Receitas cobrem as despesas'
      : result < 0
        ? 'Despesas acima das receitas'
        : 'Receitas e despesas em equilíbrio';
  const activeGoals =
    goals?.filter((goal) => goal.status === 'em_andamento') ?? [];
  const completed =
    goals?.filter((goal) => goal.status === 'concluida').length ?? 0;
  const target = activeGoals.reduce(
    (total, goal) => total + goal.valor_objetivo,
    0,
  );
  const saved = activeGoals.reduce(
    (total, goal) => total + goal.valor_atual,
    0,
  );
  const progress =
    target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const amount = (value: number) =>
    valuesVisible ? formatCurrency(value) : 'R$ ••••••';

  return (
    <section aria-labelledby="profile-financial-title" className="mt-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2
            id="profile-financial-title"
            className="text-lg font-bold text-foreground"
          >
            Seu momento financeiro
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            De {formatReportDate(start)} a {formatReportDate(today)} ·
            lançamentos confirmados
          </p>
        </div>
        <FinancialPrivacyButton />
      </div>
      {loading ? (
        <p
          role="status"
          className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted"
        >
          Carregando seu resumo financeiro...
        </p>
      ) : (
        <>
          {errors.length > 0 && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-foreground"
            >
              <p>{errors.join(' ')}</p>
              <button
                type="button"
                className="mt-2 min-h-11 font-semibold text-accent-ink underline"
                onClick={() => setRetry((value) => value + 1)}
              >
                Tentar novamente
              </button>
            </div>
          )}
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-accent/10 p-2.5 text-accent-ink">
                  <ChartNoAxesCombined size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Fluxo do mês
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {!report
                      ? 'Resumo indisponível'
                      : !valuesVisible
                        ? 'Seu resumo está protegido'
                        : status}
                  </h3>
                </div>
              </div>
              {report && (
                <>
                  <dl className="mt-6 grid grid-cols-1 gap-4 min-[440px]:grid-cols-3">
                    {[
                      {
                        label: 'Receitas',
                        value: income,
                        tone: 'text-positive',
                      },
                      {
                        label: 'Despesas',
                        value: expense,
                        tone: 'text-danger',
                      },
                      {
                        label: 'Resultado',
                        value: result,
                        tone: 'text-foreground',
                      },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0">
                        <dt className="text-xs text-muted">{item.label}</dt>
                        <dd
                          className={`mt-2 break-all text-lg font-bold tabular-nums ${valuesVisible ? item.tone : 'text-muted'}`}
                        >
                          {amount(item.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {!valuesVisible ? (
                    <p className="mt-5 flex items-center gap-2 text-xs text-muted">
                      <LockKeyhole size={15} aria-hidden="true" />
                      Valores e indicadores ocultos.
                    </p>
                  ) : !hasActivity ? (
                    <p className="mt-5 text-sm leading-6 text-muted">
                      Registre suas receitas e despesas para conhecer seu ritmo
                      financeiro.
                    </p>
                  ) : (
                    <div className="mt-5 rounded-xl bg-elevated p-3">
                      <p className="text-xs leading-5 text-muted">
                        {income > 0
                          ? `${Math.round((expense / income) * 100)}% das receitas foram destinadas a despesas neste mês.`
                          : 'Há despesas registradas e nenhuma receita confirmada neste mês.'}
                      </p>
                      {income > 0 && (
                        <div
                          aria-hidden="true"
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-hover"
                        >
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${Math.min(100, (expense / income) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              <Link
                to={`/reports?inicio=${start}&fim=${today}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline"
              >
                Analisar relatório do mês
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-progress/10 p-2.5 text-progress">
                  <Target size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Seus objetivos
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {!goals
                      ? 'Metas indisponíveis'
                      : activeGoals.length > 0
                        ? `${activeGoals.length} ${activeGoals.length === 1 ? 'meta em andamento' : 'metas em andamento'}`
                        : 'Planeje sua próxima conquista'}
                  </h3>
                </div>
              </div>
              {goals && (
                <>
                  {activeGoals.length > 0 ? (
                    <>
                      <p className="mt-6 text-xs text-muted">
                        Guardado nas metas em andamento
                      </p>
                      <p className="mt-2 break-all text-2xl font-bold tabular-nums text-foreground">
                        {amount(saved)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {valuesVisible
                          ? `de ${formatCurrency(target)} planejados · ${progress}%`
                          : 'Objetivos e progresso ocultos'}
                      </p>
                      {valuesVisible && (
                        <div
                          role="progressbar"
                          aria-label="Progresso das metas em andamento"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="mt-4 h-2 overflow-hidden rounded-full bg-hover"
                        >
                          <div
                            className="h-full rounded-full bg-progress"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-5 text-sm leading-6 text-muted">
                      Uma viagem, uma reserva ou um projeto: dê um destino ao
                      dinheiro que deseja guardar.
                    </p>
                  )}
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <Flag size={14} aria-hidden="true" />
                    {completed}{' '}
                    {completed === 1 ? 'meta concluída' : 'metas concluídas'}
                    {activeGoals.length > 0 && ' · situação atual'}
                  </p>
                </>
              )}
              <Link
                to={activeGoals.length > 0 ? '/goals' : '/goals?new=1'}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-ink hover:underline"
              >
                {activeGoals.length > 0
                  ? 'Acompanhar minhas metas'
                  : 'Criar minha próxima meta'}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
            <TrendingUp
              size={14}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            Resumo dos seus registros na CifraWealth. As metas mostram valores
            guardados informados por você.
          </p>
        </>
      )}
    </section>
  );
}
