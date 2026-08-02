export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}
