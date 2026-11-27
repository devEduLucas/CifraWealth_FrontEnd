import { useCallback, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { LoginFormData, LoginFormErrors } from '../types/form.types';
import { validateLoginForm } from '../utils/validation';
import { api, ApiError } from '../lib/api';
import { session } from '../lib/session';

const initialData: LoginFormData = {
  email: '',
  password: '',
};

type TouchedState = Partial<Record<keyof LoginFormData, boolean>>;

export function useLoginForm() {
  const [data, setData] = useState<LoginFormData>(initialData);
  const errors = useMemo<LoginFormErrors>(() => validateLoginForm(data), [data]);
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const setField = useCallback(
    <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    []
  );

  const setFieldTouched = useCallback((field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = useCallback(
    (onSuccess: () => void) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submittingRef.current) return;
      setTouched({ email: true, password: true });
      setSubmitError(null);
      if (!isValid) {
        const form = event.currentTarget;
        window.requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      api
        .login(data)
        .then((auth) => {
          session.save(auth.token, auth.user);
          onSuccess();
        })
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
    handleSubmit,
    isValid,
    submitting,
    submitError,
  };
}
