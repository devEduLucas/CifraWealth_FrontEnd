import { useEffect, useRef } from 'react';
const dialogs: HTMLDivElement[] = [];
let previousBodyOverflow = '';
const inertElements = new Map<
  HTMLElement,
  { count: number; previous: boolean }
>();

function isolateDialog(container: HTMLElement) {
  const isolated: HTMLElement[] = [];
  let branch: HTMLElement | null = container;
  while (branch?.parentElement && branch !== document.body) {
    for (const sibling of branch.parentElement.children) {
      if (
        !(sibling instanceof HTMLElement) ||
        sibling === branch ||
        ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)
      )
        continue;
      const entry = inertElements.get(sibling) ?? {
        count: 0,
        previous: sibling.inert,
      };
      entry.count++;
      inertElements.set(sibling, entry);
      sibling.inert = true;
      isolated.push(sibling);
    }
    branch = branch.parentElement;
  }
  return () =>
    isolated.forEach((element) => {
      const entry = inertElements.get(element);
      if (!entry || --entry.count > 0) return;
      element.inert = entry.previous;
      inertElements.delete(element);
    });
}

function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex], [contenteditable="true"]',
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest('[inert]') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  );
}
export function useModalFocus(
  open: boolean,
  saving: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const savingRef = useRef(saving);
  savingRef.current = saving;
  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const container = containerRef.current;
    if (!container) return;
    if (dialogs.length === 0)
      previousBodyOverflow = document.body.style.overflow;
    dialogs.push(container);
    document.body.style.overflow = 'hidden';
    const restoreInteraction = isolateDialog(container);
    const initialField =
      container?.querySelector<HTMLElement>('[data-modal-initial-focus]') ??
      container?.querySelector<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      ) ??
      container?.querySelector<HTMLElement>('button:not([disabled])');
    initialField?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (dialogs[dialogs.length - 1] !== container) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!savingRef.current) closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusableElements(container);
      if (!elements?.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !container.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !container.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
      const index = dialogs.indexOf(container);
      if (index >= 0) dialogs.splice(index, 1);
      if (dialogs.length === 0)
        document.body.style.overflow = previousBodyOverflow;
      restoreInteraction();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return containerRef;
}
