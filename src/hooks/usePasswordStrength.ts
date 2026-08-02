import { useMemo } from 'react';
import type { PasswordStrengthResult } from '../types/form.types';

export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => {
    if (!password) {
      return { score: 0, level: 'weak', label: '' };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score, level: 'weak', label: 'Fraca' };
    }
    if (score === 3) {
      return { score, level: 'medium', label: 'Média' };
    }
    return { score, level: 'strong', label: 'Forte' };
  }, [password]);
}
