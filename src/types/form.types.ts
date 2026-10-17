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

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
}

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}
