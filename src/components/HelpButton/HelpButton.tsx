import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, HelpCircle } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { getHelpSection } from '../../utils/helpContent';

export function HelpButton() {
  const { pathname, search } = useLocation();
  const section = getHelpSection(pathname === '/help' ? new URLSearchParams(search).get('section') : pathname);
  const [open, setOpen] = useState(false);
  return (
    <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Ajuda desta página"
      aria-haspopup="dialog"
      title="Ajuda desta página"
      className="app-help-button fixed right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-foreground shadow-lg shadow-black/15 transition-transform hover:scale-105 hover:bg-elevated active:scale-95 lg:right-5"
    >
      <HelpCircle size={20} aria-hidden="true" />
    </button>
    <Modal open={open} title={section.title} onClose={() => setOpen(false)}>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-secondary">{section.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}</ol>
      <p className="mt-5 rounded-xl bg-elevated p-3 text-xs leading-6 text-muted">{section.note}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        <Link to={'/help?section=' + section.id} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent-ink underline">Ver guia completo</Link>
        <Link to="/home" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted underline">Sobre o projeto <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></Link>
      </div>
    </Modal>
    </>
  );
}
