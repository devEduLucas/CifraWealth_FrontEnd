import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import type { ResetPasswordFormData, ResetPasswordFormErrors } from '../types/form.types';
import { validateResetPasswordForm } from '../utils/validation';
import { usePasswordStrength } from './usePasswordStrength';
import { api } from '../lib/api';

export function useResetPasswordForm(token?: string) {
  const [data, setData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const errors = useMemo<ResetPasswordFormErrors>(() => validateResetPasswordForm(data), [data]);
  const passwordStrength = usePasswordStrength(data.password);
  const isValid = Object.keys(errors).length === 0;

  function setField<K extends keyof ResetPasswordFormData>(field: K, value: ResetPasswordFormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  }

  function setFieldTouched(field: keyof ResetPasswordFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(onSuccess?: () => void) {
    return async (event: FormEvent) => {
      event.preventDefault();
      if (submitting) return;
      setFieldTouched('password');
      setFieldTouched('confirmPassword');

      const validationErrors = validateResetPasswordForm(data);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        if (!token) throw new Error('Solicite um novo link de recuperação para redefinir a senha.');
        await api.resetPassword(token, data.password);
        setData({ password: '', confirmPassword: '' });
        setIsSuccess(true);
        onSuccess?.();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
      } finally {
        setSubmitting(false);
      }
    };
  }

  return {
    data,
    errors,
    touched,
    isValid,
    submitting,
    submitError,
    isSuccess,
    passwordStrength,
    setField,
    setFieldTouched,
    handleSubmit,
  };
}
