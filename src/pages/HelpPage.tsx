import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { useSessionUser } from '../hooks/useSessionUser';
import { getHelpSection, HELP_SECTIONS } from '../utils/helpContent';

export function HelpPage() {
  const user = useSessionUser();
  const [params] = useSearchParams();
  const section = getHelpSection(params.get('section'));
  const fullName = [user?.nome, user?.sobrenome].filter(Boolean).join(' ') || 'Usuário';

  return (
    <DashboardLayout userName={fullName}>
      <PageHeader title="Como usar a CifraWealth" subtitle="Orientações rápidas para organizar seus registros, uma tarefa por vez." />
      <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Assuntos da ajuda" className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-3 lg:flex-col">
          {HELP_SECTIONS.map((item) => (
            <Link key={item.id} to={'/help?section=' + item.id} aria-current={section.id === item.id ? 'page' : undefined}
              className={'min-h-11 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ' + (section.id === item.id ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated hover:text-foreground')}>
              {item.label}
            </Link>
          ))}
        </nav>
        <section aria-labelledby="help-topic-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
          <HelpCircle size={24} className="mb-4 text-accent-ink" aria-hidden="true" />
          <h2 id="help-topic-title" className="text-xl font-bold text-foreground">{section.title}</h2>
          <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-7 text-secondary">
            {section.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
          </ol>
          <p className="mt-6 rounded-xl bg-elevated p-4 text-sm leading-6 text-muted">{section.note}</p>
          <Link to={section.to} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-on-accent hover:bg-accent-hover">{section.action}<ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      </div>
      <p className="mt-6 text-sm text-muted">Quer conhecer a proposta do projeto? <Link to="/home" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent-ink underline">Sobre a CifraWealth <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></Link></p>
    </DashboardLayout>
  );
}
