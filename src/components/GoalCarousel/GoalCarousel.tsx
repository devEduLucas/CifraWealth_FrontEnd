import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GoalViewModel } from '../../types/goals.types';
import { GoalListCard } from '../GoalListCard/GoalListCard';

export function GoalCarousel({ goals, valuesVisible }: { goals: GoalViewModel[]; valuesVisible: boolean }) {
  const track = useRef<HTMLUListElement>(null);
  const trackId = useId();
  const hintId = useId();
  const [edges, setEdges] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    element.scrollLeft = 0;
    const measure = () => setEdges({ previous: element.scrollLeft > 2, next: element.scrollLeft + element.clientWidth < element.scrollWidth - 2 });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', measure); };
  }, [goals]);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const distance = (element.firstElementChild?.getBoundingClientRect().width ?? element.clientWidth) + 16;
    element.scrollBy({ left: distance * direction, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  return <section aria-label="Coleção de metas" className="min-w-0">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p id={hintId} className="text-xs text-muted">Deslize para explorar. Abra uma meta para acompanhar seu plano.</p>
      <div className="flex gap-2">
        <button type="button" aria-label="Metas anteriores" aria-controls={trackId} disabled={!edges.previous} onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground hover:bg-elevated disabled:opacity-35"><ArrowLeft size={18} aria-hidden="true" /></button>
        <button type="button" aria-label="Próximas metas" aria-controls={trackId} disabled={!edges.next} onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-foreground hover:bg-elevated disabled:opacity-35"><ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
    <ul ref={track} id={trackId} aria-label="Suas metas" aria-describedby={hintId} tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth }); }
      }}
      className="goal-carousel flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-2xl pb-4 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
      {goals.map((goal) => <li key={goal.id} className="w-[min(82vw,20rem)] shrink-0 snap-start"><GoalListCard goal={goal} valuesVisible={valuesVisible} /></li>)}
    </ul>
  </section>;
}
