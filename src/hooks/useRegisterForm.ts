import { useCallback, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { RegisterFormData, RegisterFormErrors } from '../types/form.types';
import { validateRegisterForm } from '../utils/validation';
import { api, ApiError } from '../lib/api';

const initialData: RegisterFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

type TouchedState = Partial<Record<keyof RegisterFormData, boolean>>;

export function useRegisterForm() {
  const [data, setData] = useState<RegisterFormData>(initialData);
  const errors = useMemo<RegisterFormErrors>(() => validateRegisterForm(data), [data]);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const setField = useCallback(
    <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    []
  );

  const setFieldTouched = useCallback((field: keyof RegisterFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const isValid = Object.keys(errors).length === 0;
  const validate = useCallback(() => isValid, [isValid]);

  const handleSubmit = useCallback(
    (onSuccess: (email: string) => void) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submittingRef.current) return;
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        acceptTerms: true,
      });
      setSubmitError(null);
      if (!isValid) {
        const form = event.currentTarget;
        window.requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      api
        .register({ fullName: data.fullName, email: data.email, password: data.password })
        .then((result) => onSuccess(result.email))
        .catch((error: unknown) => {
          setSubmitError(error instanceof ApiError ? error.message : 'Erro de conexão com o servidor.');
        })
        .finally(() => {
          submittingRef.current = false;
          setSubmitting(false);
        });
    },
    [data, isValid]
  );

  return {
    data,
    errors,
    touched,
    setField,
    setFieldTouched,
    validate,
    handleSubmit,
    isValid,
    submitting,
    submitError,
  };
}
