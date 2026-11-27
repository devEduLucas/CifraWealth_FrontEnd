import { useEffect, type RefObject } from 'react';
import { shouldReduceMotion } from '../utils/motion';

const EASING = 'cubic-bezier(0.22, 0.68, 0.22, 1)';
const FRAMES: Record<string, Keyframe[]> = {
  line: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
  area: [{ opacity: 0.15 }, { opacity: 1 }],
  bar: [{ transform: 'scaleY(0.04)' }, { transform: 'scaleY(1)' }],
  point: [{ opacity: 0.2, transform: 'scale(0.75)' }, { opacity: 1, transform: 'scale(1)' }],
  donut: [{ opacity: 0.15, transform: 'scale(0.94)' }, { opacity: 1, transform: 'scale(1)' }],
  progress: [{ transform: 'scaleX(0.04)' }, { transform: 'scaleX(1)' }],
};

/** Animate paint only: reported amounts and SVG coordinates always keep their final values. */
export function useChartMotion(ref: RefObject<HTMLElement>, dataKey: string, enabled = true) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let animations: Animation[] = [];
    let disposed = false, run = 0;
    const setState = (state: string) => { if (!disposed) element.dataset.motionState = state; };
    const cancel = () => {
      run++;
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    if (!enabled) { setState('idle'); return; }
    const play = () => {
      if (disposed) return;
      if (shouldReduceMotion()) { setState('reduced'); return; }
      const nodes = element.querySelectorAll<HTMLElement | SVGElement>('[data-chart-motion]');
      for (const node of nodes) {
        const frames = FRAMES[node.dataset.chartMotion ?? ''];
        if (!frames || typeof node.animate !== 'function') continue;
        const order = Math.min(8, Math.max(0, Number(node.dataset.motionIndex) || 0));
        try {
          animations.push(node.animate(frames, { duration: node.dataset.chartMotion === 'line' ? 650 : 520,
            delay: order * 28, easing: EASING, fill: 'backwards' }));
        } catch { /* Unsupported animation properties leave the original chart visible. */ }
      }
      if (!animations.length) { setState('finished'); return; }
      setState('playing');
      const currentRun = ++run;
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        if (!disposed && run === currentRun) { animations = []; setState('finished'); }
      });
    };
    const preferencesChanged = () => {
      if (shouldReduceMotion()) { cancel(); setState('reduced'); }
    };
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', preferencesChanged);
    const preferences = new MutationObserver(preferencesChanged);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ['data-a11y-reduced-motion'] });
    setState('waiting');
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') play();
    else {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { observer?.disconnect(); play(); }
      }, { threshold: 0.15 });
      observer.observe(element);
    }
    return () => {
      disposed = true; cancel(); observer?.disconnect(); preferences.disconnect();
      media.removeEventListener('change', preferencesChanged);
    };
  }, [ref, dataKey, enabled]);
}
