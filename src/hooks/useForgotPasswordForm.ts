import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import type { ForgotPasswordFormData, ForgotPasswordFormErrors } from '../types/form.types';
import { validateForgotPasswordForm } from '../utils/validation';
import { api } from '../lib/api';

export function useForgotPasswordForm() {
  const [data, setData] = useState<ForgotPasswordFormData>({ email: '' });
  const [touched, setTouched] = useState<{ email: boolean }>({ email: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const errors = useMemo<ForgotPasswordFormErrors>(() => validateForgotPasswordForm(data), [data]);
  const isValid = Object.keys(errors).length === 0;

  function setField(value: string) {
    setData({ email: value });
    setSubmitError(null);
  }

  function setFieldTouched() {
    setTouched({ email: true });
  }

  function handleSubmit(onSuccess?: (email: string) => void) {
    return async (event: FormEvent) => {
      event.preventDefault();
      if (submitting) return;
      setFieldTouched();

      const validationErrors = validateForgotPasswordForm(data);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        await api.forgotPassword(data.email);
        setIsSubmitted(true);
        onSuccess?.(data.email);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Não foi possível solicitar a recuperação.');
      } finally {
        setSubmitting(false);
      }
    };
  }

  function reset() {
    setIsSubmitted(false);
    setData({ email: '' });
    setTouched({ email: false });
    setSubmitError(null);
  }

  return {
    data,
    errors,
    touched,
    isValid,
    submitting,
    submitError,
    isSubmitted,
    setField,
    setFieldTouched,
    handleSubmit,
    reset,
  };
}
