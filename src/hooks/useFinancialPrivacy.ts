import { useSyncExternalStore } from 'react';

const KEY = 'cifrawealth:hide-financial-values';
const EVENT = 'cifrawealth:financial-privacy';
let fallback = false;
let memoryOnly = false;

function getHidden() {
  if (memoryOnly) return fallback;
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return fallback;
  }
}

function subscribe(callback: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', sync);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', sync);
  };
}

export function useFinancialPrivacy() {
  const hidden = useSyncExternalStore(subscribe, getHidden);
  return {
    valuesVisible: !hidden,
    toggleValues() {
      fallback = !getHidden();
      try {
        localStorage.setItem(KEY, String(fallback));
      } catch {
        memoryOnly = true;
      }
      window.dispatchEvent(new Event(EVENT));
    },
  };
}
