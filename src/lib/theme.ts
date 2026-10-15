export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'cifrawealth:theme';
const CHANGE_EVENT = 'cifrawealth:themechange';

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function initializeTheme() {
  let theme: Theme = 'dark';
  try { if (localStorage.getItem(STORAGE_KEY) === 'light') theme = 'light'; } catch { /* Storage may be unavailable. */ }
  applyTheme(theme);
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* The theme still works for this session. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToTheme(callback: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    initializeTheme();
    callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', sync);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', sync);
  };
}
