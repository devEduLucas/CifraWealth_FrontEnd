import { useSyncExternalStore } from 'react';
import { getTheme, getThemePreference, setTheme, setThemePreference, subscribeToTheme } from '../lib/theme';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme);
  const preference = useSyncExternalStore(subscribeToTheme, getThemePreference);
  return { theme, preference, setPreference: setThemePreference, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
