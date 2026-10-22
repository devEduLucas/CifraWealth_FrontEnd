import { useLayoutEffect, useRef } from 'react';
import '../styles/scroll-reveal.css';

const TARGET = '[data-reveal]';
const READY_ATTR = 'data-reveal-ready';
const REVEALED_ATTR = 'data-revealed';
const SETTLE_FALLBACK_MS = 2000;

/**
 * Revela elementos marcados com data-reveal quando entram na viewport (IntersectionObserver).
 * Retorne o ref para o contêiner raiz da página; o efeito fica restrito a ele.
 *
 * - Sem IntersectionObserver ou com prefers-reduced-motion: nada é ocultado.
 * - Elementos já acima da viewport (ex.: abertura por âncora #secao) aparecem sem animação.
 * - Após a animação o elemento perde os data-attributes, devolvendo seus estilos originais
 *   (hover, transitions próprias do Tailwind).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const rootRef = useRef<T>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(TARGET));
    if (targets.length === 0) return;

    const timers: number[] = [];
    let observer: IntersectionObserver | undefined;

    const settle = (el: HTMLElement) => {
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-reveal-delay');
      el.removeAttribute(REVEALED_ATTR);
    };

    const reveal = (el: HTMLElement, animate: boolean) => {
      if (!animate) {
        settle(el);
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        el.removeEventListener('transitionend', onEnd);
        settle(el);
      };
      const onEnd = (event: TransitionEvent) => {
        if (event.target === el) finish();
      };
      el.addEventListener('transitionend', onEnd);
      timers.push(window.setTimeout(finish, SETTLE_FALLBACK_MS));
      el.setAttribute(REVEALED_ATTR, '');
    };

    try {
      root.setAttribute(READY_ATTR, '');
      void root.offsetHeight; // garante o estado oculto aplicado antes da primeira transição

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) reveal(el, true);
            else if (entry.boundingClientRect.top < 0) reveal(el, false);
            else continue;
            observer?.unobserve(el);
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
      );
      targets.forEach((el) => observer?.observe(el));
    } catch {
      // Qualquer falha: mostra todo o conteúdo.
      root.removeAttribute(READY_ATTR);
      targets.forEach(settle);
    }

    return () => {
      observer?.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      root.removeAttribute(READY_ATTR);
    };
  }, []);

  return rootRef;
}
