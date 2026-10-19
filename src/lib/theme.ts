export type Theme = 'dark' | 'light';
export type ThemePreference = Theme | 'system';
const STORAGE_KEY = 'cifrawealth:theme';
const CHANGE_EVENT = 'cifrawealth:themechange';
let preference: ThemePreference = 'system';
let deviceTheme: MediaQueryList | undefined;

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* Device preference also works when storage is unavailable. */ }
  return 'system';
}

export function getThemePreference(): ThemePreference { return preference; }

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = theme;
}

function applyPreference() {
  applyTheme(preference === 'system' ? (deviceTheme?.matches ? 'dark' : 'light') : preference);
}

export function initializeTheme() {
  if (!deviceTheme) {
    deviceTheme = window.matchMedia('(prefers-color-scheme: dark)');
    deviceTheme.addEventListener('change', () => {
      if (preference !== 'system') return;
      applyPreference();
      window.dispatchEvent(new Event(CHANGE_EVENT));
    });
  }
  preference = readPreference();
  applyPreference();
}

export function setThemePreference(value: ThemePreference) {
  preference = value;
  applyPreference();
  try {
    if (value === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch { /* The preference still works for this session. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setTheme(theme: Theme) { setThemePreference(theme); }

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
