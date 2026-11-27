import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Compass, ExternalLink, HelpCircle, Search, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { useOnboarding } from '../hooks/useOnboarding';
import { useSessionUser } from '../hooks/useSessionUser';
import { getHelpSection, HELP_SECTIONS, searchHelp } from '../utils/helpContent';
import { preferredScrollBehavior } from '../utils/motion';

const TOUR_TOPICS = new Set(['dashboard', 'transactions', 'categories', 'goals', 'reports', 'profile']);

export function HelpPage() {
  const user = useSessionUser();
  const { startTour } = useOnboarding();
  const [params, setParams] = useSearchParams();
  const section = getHelpSection(params.get('section'));
  const query = params.get('q') ?? '';
  const searching = query.trim().length > 0;
  const results = searchHelp(query);
  const activeQuestion = params.get('question');
  const previousTopic = useRef(section.id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const fullName = [user?.nome, user?.sobrenome].filter(Boolean).join(' ') || 'Usuário';

  useEffect(() => {
    if (previousTopic.current === section.id) return;
    previousTopic.current = section.id;
    if (searching || activeQuestion) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start', behavior: preferredScrollBehavior() });
  }, [section.id, searching, activeQuestion]);

  useEffect(() => {
    if (searching || !section.questions.some((question) => question.id === activeQuestion)) return;
    const answer = document.getElementById(`help-question-${section.id}-${activeQuestion}`);
    answer?.focus({ preventScroll: true });
    answer?.scrollIntoView({ block: 'start', behavior: preferredScrollBehavior() });
  }, [section, activeQuestion, searching]);

  function changeQuery(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    next.delete('question');
    setParams(next, { replace: true, preventScrollReset: true });
  }

  function clearQuery() {
    changeQuery('');
    searchRef.current?.focus();
  }

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader title="Como usar a CifraWealth" subtitle="Encontre respostas ou conheça o site passo a passo." />

      <section data-tour="help-center" aria-labelledby="help-tour-title" className="finance-hero mb-5 flex min-w-0 flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-xl bg-white/10 p-2.5"><Compass size={24} aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 id="help-tour-title" className="text-lg font-bold">Conheça os caminhos do site</h2>
            <p className="hero-muted mt-1 max-w-xl text-sm leading-6">O tour destaca as ações nas próprias telas. Você pode pular, sair e repetir quando quiser.</p>
          </div>
        </div>
        <button data-tour-start="all" type="button" onClick={() => startTour()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-950 transition-colors hover:bg-blue-50">
          <Compass size={18} aria-hidden="true" />Iniciar tour guiado
        </button>
      </section>

      <div role="search" className="mb-5 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <label htmlFor="help-search" className="mb-2 block text-sm font-semibold text-foreground">Buscar na ajuda</label>
        <div className="field-shell">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 text-muted" />
          <input ref={searchRef} id="help-search" type="search" autoComplete="off" maxLength={160} value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Ex.: guardar na meta, senha, PDF..." className="min-w-0 pl-10 pr-12 text-sm text-foreground placeholder:text-subtle" />
          {query && <button type="button" onClick={clearQuery} aria-label="Limpar busca" className="absolute right-0.5 flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground"><X size={18} aria-hidden="true" /></button>}
        </div>
        {searching && <p role="status" aria-label="Resultado da busca" aria-live="polite" aria-atomic="true" className="mt-2 text-xs text-muted">{results.length} {results.length === 1 ? 'assunto encontrado' : 'assuntos encontrados'}.</p>}
      </div>

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Assuntos da ajuda" className="flex min-w-0 max-w-full gap-2 overflow-x-auto rounded-2xl border border-line bg-surface p-3 lg:sticky lg:top-24 lg:flex-col">
          {HELP_SECTIONS.map((item) => (
            <Link key={item.id} to={'/help?section=' + item.id} aria-current={!searching && section.id === item.id ? 'page' : undefined}
              className={'flex min-h-11 shrink-0 items-center rounded-xl px-3 py-3 text-sm font-semibold transition-colors ' + (!searching && section.id === item.id ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated hover:text-foreground')}>
              {item.label}
            </Link>
          ))}
        </nav>

        {searching ? (
          <section aria-labelledby="help-results-title" className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <h2 id="help-results-title" className="text-xl font-bold text-foreground">{results.length ? 'Resultados da busca' : 'Nenhum resultado encontrado.'}</h2>
            {results.length ? <ul className="mt-5 space-y-4">
              {results.map(({ section: item, questions }) => <li key={item.id} className="min-w-0 rounded-xl border border-line p-4">
                <Link to={'/help?section=' + item.id} className="flex min-h-11 items-center justify-between gap-3 font-semibold text-accent-ink hover:underline"><span className="min-w-0 break-words">{item.label}</span><ArrowRight size={17} aria-hidden="true" className="shrink-0" /></Link>
                <p className="mt-1 text-sm text-secondary">{item.title}</p>
                {questions.length > 0 && <ul className="mt-3 border-t border-line pt-2">
                  {questions.slice(0, 3).map((question) => <li key={question.id}><Link to={'/help?section=' + item.id + '&question=' + question.id} className="inline-flex min-h-11 items-center text-sm leading-6 text-accent-ink hover:underline">{question.question}</Link></li>)}
                </ul>}
              </li>)}
            </ul> : <div className="mt-4">
              <p className="text-sm leading-6 text-muted">Tente uma palavra como saldo, categoria, meta ou senha. Você também pode escolher um assunto no menu.</p>
              <button type="button" onClick={clearQuery} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-elevated">Limpar pesquisa</button>
            </div>}
          </section>
        ) : (
          <section aria-labelledby="help-topic-title" className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <HelpCircle size={24} className="mb-4 text-accent-ink" aria-hidden="true" />
            <h2 ref={headingRef} id="help-topic-title" tabIndex={-1} className="scroll-mt-24 text-xl font-bold text-foreground">{section.title}</h2>
            <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-7 text-secondary">
              {section.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
            </ol>
            <p className="mt-6 rounded-xl bg-elevated p-4 text-sm leading-6 text-muted">{section.note}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={section.to} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover">{section.action}<ArrowRight size={16} aria-hidden="true" /></Link>
              {TOUR_TOPICS.has(section.id) && <button data-tour-start={section.id} type="button" onClick={() => startTour(section.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold text-accent-ink hover:bg-elevated"><Compass size={17} aria-hidden="true" />Ver tour desta área</button>}
            </div>

            <h3 className="mb-3 mt-8 text-base font-semibold text-foreground">Dúvidas frequentes</h3>
            <div className="divide-y divide-line rounded-xl border border-line px-4">
              {section.questions.map((question) => <details key={section.id + ':' + question.id + ':' + activeQuestion} open={activeQuestion === question.id} className="py-1">
                <summary id={`help-question-${section.id}-${question.id}`} className="min-h-11 scroll-mt-24 cursor-pointer py-3 text-sm font-semibold leading-6 text-foreground">{question.question}</summary>
                <p className="pb-4 text-sm leading-7 text-secondary">{question.answer}</p>
              </details>)}
            </div>
          </section>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">Quer conhecer a proposta do projeto? <Link to="/home" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent-ink underline">Sobre a CifraWealth <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></Link></p>
    </DashboardLayout>
  );
}
