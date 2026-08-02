import type {
  LoginFormData,
  LoginFormErrors,
  RegisterFormData,
  RegisterFormErrors,
} from '../types/form.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function hasMinPasswordLength(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function validateRegisterForm(data: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!isRequired(data.fullName)) {
    errors.fullName = 'Informe seu nome completo.';
  }

  if (!isRequired(data.email)) {
    errors.email = 'Informe seu e-mail.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!isRequired(data.password)) {
    errors.password = 'Informe uma senha.';
  } else if (!hasMinPasswordLength(data.password)) {
    errors.password = `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = 'Você precisa aceitar os termos para continuar.';
  }

  return errors;
}

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!isRequired(data.email)) {
    errors.email = 'Informe seu e-mail.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!isRequired(data.password)) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export { MIN_PASSWORD_LENGTH };

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}