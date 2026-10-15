import { useEffect, useRef } from 'react';
const dialogs: HTMLDivElement[] = [];
let previousBodyOverflow = '';
export function useModalFocus(open: boolean, saving: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const savingRef = useRef(saving); savingRef.current = saving;
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = containerRef.current;
    if (!container) return;
    if (dialogs.length === 0) previousBodyOverflow = document.body.style.overflow;
    dialogs.push(container);
    document.body.style.overflow = 'hidden';
    const initialField = container?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ?? container?.querySelector<HTMLElement>('button:not([disabled])');
    initialField?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (dialogs[dialogs.length - 1] !== container) return;
      if (event.key === 'Escape' && !savingRef.current) { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const elements = container?.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      if (!elements?.length) { event.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      const index = dialogs.indexOf(container);
      if (index >= 0) dialogs.splice(index, 1);
      if (dialogs.length === 0) document.body.style.overflow = previousBodyOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return containerRef;
}
