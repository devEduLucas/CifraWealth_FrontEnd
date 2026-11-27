import { createContext, useContext } from 'react';

export const OnboardingContext = createContext<{ startTour: (section?: string) => void } | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('O guia deve ser usado dentro do aplicativo.');
  return context;
}
