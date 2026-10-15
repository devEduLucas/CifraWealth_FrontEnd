import { useSyncExternalStore } from 'react';
import { getTheme, setTheme, subscribeToTheme } from '../lib/theme';

export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme);
  return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
