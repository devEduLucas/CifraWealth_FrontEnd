interface MotionPreferences {
  appReducedMotion?: boolean;
  systemReducedMotion?: boolean;
}

/** Either accessibility preference is enough to avoid programmatic animation. */
export function shouldReduceMotion(preferences: MotionPreferences = {}): boolean {
  const appReducedMotion = preferences.appReducedMotion ?? (
    typeof document !== 'undefined' && document.documentElement.dataset.a11yReducedMotion === 'true'
  );
  const systemReducedMotion = preferences.systemReducedMotion ?? (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return appReducedMotion || systemReducedMotion;
}

export function preferredScrollBehavior(preferences: MotionPreferences = {}): ScrollBehavior {
  // "auto" can still inherit smooth scrolling from CSS.
  return shouldReduceMotion(preferences) ? 'instant' : 'smooth';
}
