import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useModalFocus } from '../../hooks/useModalFocus';
import type { TourStep } from '../../utils/onboarding';

interface Rect { top: number; left: number; right: number; bottom: number; width: number; height: number }
interface TourOverlayProps {
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export function TourOverlay({ step, index, total, onNext, onPrevious, onClose }: TourOverlayProps) {
  const location = useLocation();
  const dialogRef = useModalFocus(true, false, onClose);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const titleId = useId(), descriptionId = useId();
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [cardHeight, setCardHeight] = useState(330);

  useEffect(() => {
    const card = dialogRef.current;
    if (!card) return;
    const measure = () => setCardHeight(card.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure); observer.observe(card);
    return () => observer.disconnect();
  }, [dialogRef]);

  useEffect(() => {
    setRect(null); setReady(false);
    copyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    titleRef.current?.focus({ preventScroll: true });
    const expected = new URL(step.to, window.location.origin);
    if (location.pathname !== expected.pathname || location.search !== expected.search) return;
    let target: HTMLElement | null = null;
    let timer = 0, frame = 0;
    let cancelled = false;
    const started = performance.now();
    let fellBack = false;
    const measure = () => {
      if (cancelled) return;
      const width = document.documentElement.clientWidth, height = window.innerHeight;
      setViewport({ width, height });
      if (!target?.isConnected) { setRect(null); return; }
      const box = target.getBoundingClientRect();
      const left = Math.max(8, box.left - 6), right = Math.min(width - 8, box.right + 6);
      const top = Math.max(72, box.top - 6), bottom = Math.min(height - 8, box.bottom + 6);
      setRect(right > left && bottom > top ? { left, right, top, bottom, width: right - left, height: bottom - top } : null);
    };
    const queueMeasure = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const resizeObserver = new ResizeObserver(queueMeasure);
    const find = () => {
      if (cancelled) return;
      const candidate = document.querySelector<HTMLElement>(step.target);
      if (candidate && candidate.getClientRects().length > 0) {
        target = candidate;
        // Explicit instant also overrides the page's smooth-scroll CSS.
        const y = Math.max(0, window.scrollY + candidate.getBoundingClientRect().top - 88);
        window.scrollTo({ top: y, behavior: 'instant' });
        resizeObserver.observe(candidate); measure(); setReady(true);
      } else if (performance.now() - started < 2200) timer = window.setTimeout(find, 50);
      else if (!fellBack) { fellBack = true; setReady(true); }
    };
    const lateTarget = new MutationObserver(() => {
      if (!target?.isConnected && performance.now() - started >= 2200) find();
    });
    // The route's main element can be replaced when a lazy page finishes loading.
    lateTarget.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    find();
    window.addEventListener('resize', queueMeasure);
    window.addEventListener('scroll', queueMeasure, true);
    return () => {
      cancelled = true; window.clearTimeout(timer); cancelAnimationFrame(frame); resizeObserver.disconnect(); lateTarget.disconnect();
      window.removeEventListener('resize', queueMeasure); window.removeEventListener('scroll', queueMeasure, true);
    };
  }, [step, location.pathname, location.search]);

  const width = Math.min(400, viewport.width - 32);
  let left = Math.max(16, viewport.width - width - 16);
  let top = Math.max(80, viewport.height - cardHeight - 16);
  if (rect && viewport.width >= 768) {
    if (rect.right + 16 + width <= viewport.width - 16) { left = rect.right + 16; top = rect.top; }
    else if (rect.left - 16 - width >= 16) { left = rect.left - width - 16; top = rect.top; }
    else if (rect.bottom + 16 + cardHeight <= viewport.height - 16) { left = Math.max(16, Math.min(rect.left, viewport.width - width - 16)); top = rect.bottom + 16; }
    else if (rect.top - 16 - cardHeight >= 80) { left = Math.max(16, Math.min(rect.left, viewport.width - width - 16)); top = rect.top - 16 - cardHeight; }
  }
  top = Math.min(Math.max(16, top), Math.max(16, viewport.height - cardHeight - 16));
  const mask = 'fixed bg-black/65';
  const last = index === total - 1;
  return createPortal(
    <div className="fixed inset-0 z-[110]" data-tour-overlay="true">
      {rect ? <div aria-hidden="true" className="pointer-events-none">
        <div className={mask} style={{ left: 0, top: 0, width: '100%', height: rect.top }} />
        <div className={mask} style={{ left: 0, top: rect.bottom, width: '100%', bottom: 0 }} />
        <div className={mask} style={{ left: 0, top: rect.top, width: rect.left, height: rect.height }} />
        <div className={mask} style={{ left: rect.right, top: rect.top, right: 0, height: rect.height }} />
        <div data-tour-highlight="true" className="fixed rounded-xl border-2 border-accent shadow-[0_0_0_3px_rgb(var(--color-accent)/0.25)]" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      </div> : <div aria-hidden="true" className="fixed inset-0 bg-black/65" />}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Tour guiado" aria-describedby={descriptionId}
        tabIndex={-1} data-tour-step={step.id} className="fixed flex max-h-[min(65dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface text-foreground shadow-2xl shadow-black/30 md:max-h-[calc(100dvh-2rem)]"
        style={{ width, left, top }}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink"><Compass size={18} aria-hidden="true" />Tour guiado</span>
          <button type="button" aria-label="Sair do tour" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-elevated"><X size={18} aria-hidden="true" /></button>
        </div>
        <div ref={copyRef} data-tour-copy className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Passo {index + 1} de {total}</p>
          <h2 ref={titleRef} id={titleId} data-modal-initial-focus tabIndex={-1} className="mt-2 text-lg font-bold leading-snug text-foreground">{step.title}</h2>
          <p id={descriptionId} className="mt-3 text-sm leading-6 text-secondary">{step.description}</p>
          <p className="mt-3 rounded-xl bg-elevated p-3 text-sm leading-6 text-secondary">{step.detail}</p>
          {ready && !rect && <p className="mt-3 text-xs leading-5 text-muted">Esta área não está visível no momento. Você pode continuar o guia e consultá-la depois pelo menu.</p>}
          {!ready && <p role="status" className="mt-3 text-xs text-muted">Localizando esta área...</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3">
          <button type="button" onClick={onPrevious} disabled={index === 0 || !ready} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-secondary hover:bg-elevated disabled:opacity-40"><ArrowLeft size={16} aria-hidden="true" />Voltar</button>
          <button type="button" onClick={onNext} disabled={!ready} className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-40">{last ? 'Concluir' : 'Próximo'}{last ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button>
        </div>
      </div>
    </div>, document.body,
  );
}
