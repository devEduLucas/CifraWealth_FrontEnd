import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck } from 'lucide-react';
import { useSessionUser } from '../../hooks/useSessionUser';
import { OnboardingContext } from '../../hooks/useOnboarding';
import { getTourSteps, readOnboardingStatus, writeOnboardingStatus, type OnboardingStatus, type TourStep } from '../../utils/onboarding';
import { Modal } from '../Modal/Modal';
import { TourOverlay } from './TourOverlay';

interface TourState { steps: readonly TourStep[]; index: number }
interface Origin { href: string; x: number; y: number; focus: HTMLElement | null; focusKey: string | null }
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  const userId = user?.id_usuario ?? null;
  const previousUser = useRef(userId);
  const memorySeen = useRef(new Set<number>());
  const [offerFor, setOfferFor] = useState<number | null>(null);
  const [welcome, setWelcome] = useState(false);
  const [tour, setTour] = useState<TourState | null>(null);
  const origin = useRef<Origin | null>(null);
  const restore = useRef<Origin | null>(null);
  const location = useLocation();
  const previousLocation = useRef(location.key);
  const navigate = useNavigate();

  const remember = useCallback((status: OnboardingStatus) => {
    if (!userId) return;
    memorySeen.current.add(userId); writeOnboardingStatus(userId, status);
  }, [userId]);

  // A restored session is not a new login. Offer only on an actual account transition.
  useEffect(() => {
    const previous = previousUser.current; previousUser.current = userId;
    if (previous !== userId) { setWelcome(false); setTour(null); origin.current = null; restore.current = null; }
    if (!userId) {
      setOfferFor(null); setWelcome(false); setTour(null); origin.current = null; restore.current = null;
    } else if (previous !== userId && !memorySeen.current.has(userId) && !readOnboardingStatus(userId)) setOfferFor(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId || offerFor !== userId || location.pathname !== '/dashboard') return;
    const show = () => {
      if (document.querySelector('[aria-modal="true"]')) return;
      remember('offered'); setOfferFor(null); setWelcome(true);
    };
    show();
    const observer = new MutationObserver(show);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [userId, offerFor, location.pathname, remember]);

  const dismissWelcome = useCallback(() => { remember('dismissed'); setWelcome(false); }, [remember]);
  const startTour = useCallback((section?: string) => {
    if (!userId) return;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    origin.current = { href: location.pathname + location.search, x: window.scrollX, y: window.scrollY, focus, focusKey: focus?.getAttribute('data-tour-start') ?? null };
    const steps = getTourSteps(section);
    remember('offered'); setOfferFor(null); setWelcome(false); setTour({ steps, index: 0 });
    if (location.pathname + location.search !== steps[0].to) navigate(steps[0].to, { replace: true });
  }, [userId, location.pathname, location.search, navigate, remember]);

  const stopTour = useCallback((status: OnboardingStatus = 'dismissed', returnToOrigin = true) => {
    remember(status); setTour(null);
    if (returnToOrigin && origin.current) {
      restore.current = origin.current;
      if (location.pathname + location.search !== origin.current.href) navigate(origin.current.href, { replace: true });
    }
    origin.current = null;
  }, [location.pathname, location.search, navigate, remember]);

  // Respect browser Back or other navigation instead of forcing the tour's route.
  useEffect(() => {
    if (previousLocation.current === location.key) return;
    previousLocation.current = location.key;
    if (tour && location.pathname + location.search !== tour.steps[tour.index].to) stopTour('dismissed', false);
  }, [location.key, location.pathname, location.search, tour, stopTour]);

  useEffect(() => {
    const target = restore.current;
    if (tour || !target || location.pathname + location.search !== target.href) return;
    let frame = 0, attempts = 0;
    const finish = () => {
      if (document.documentElement.scrollHeight - window.innerHeight < target.y - 1 && attempts++ < 60) { frame = requestAnimationFrame(finish); return; }
      window.scrollTo({ left: target.x, top: target.y, behavior: 'instant' });
      const matchingButton = target.focusKey === null ? null : Array.from(document.querySelectorAll<HTMLElement>('[data-tour-start]')).find((element) => element.getAttribute('data-tour-start') === target.focusKey);
      const focus = target.focus?.isConnected ? target.focus : matchingButton ?? document.getElementById('conteudo-principal');
      focus?.focus({ preventScroll: true }); restore.current = null;
    };
    frame = requestAnimationFrame(finish);
    return () => cancelAnimationFrame(frame);
  }, [tour, location.pathname, location.search]);

  const move = (direction: number) => {
    if (!tour) return;
    const index = tour.index + direction;
    if (index >= tour.steps.length) { stopTour('completed'); return; }
    if (index < 0) return;
    const step = tour.steps[index]; setTour({ ...tour, index });
    if (location.pathname + location.search !== step.to) navigate(step.to, { replace: true });
  };
  const context = useMemo(() => ({ startTour }), [startTour]);
  return <OnboardingContext.Provider value={context}>
    {children}
    <Modal open={welcome} title="Conheça a CifraWealth" onClose={dismissWelcome}>
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-ink"><Compass size={26} aria-hidden="true" /></span>
      <p className="text-sm leading-6 text-secondary">Quer ver onde registrar movimentações, acompanhar metas e consultar seus relatórios?</p>
      <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted"><ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-positive" />Você pode sair quando quiser. O guia não cria registros nem altera seus dados.</p>
      <button type="button" onClick={() => startTour()} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover"><Compass size={18} aria-hidden="true" />Conhecer o site</button>
      <button type="button" onClick={dismissWelcome} className="mt-2 min-h-11 w-full rounded-xl px-4 text-sm font-semibold text-secondary hover:bg-elevated">Explorar por conta própria</button>
      <p className="mt-3 text-center text-xs text-muted">Você pode abrir o tour novamente pela Ajuda.</p>
    </Modal>
    {tour && <TourOverlay step={tour.steps[tour.index]} index={tour.index} total={tour.steps.length} onClose={() => stopTour()} onPrevious={() => move(-1)} onNext={() => move(1)} />}
  </OnboardingContext.Provider>;
}
