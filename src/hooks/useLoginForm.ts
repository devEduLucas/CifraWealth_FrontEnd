import { useCallback, useState } from 'react';
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
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setFieldTouched = useCallback((field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = validateLoginForm(data);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [data]);

  const handleSubmit = useCallback(
    (onSuccess: () => void) => (event: FormEvent) => {
      event.preventDefault();
      setTouched({ email: true, password: true });
      setSubmitError(null);
      if (!validate()) return;

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
        .finally(() => setSubmitting(false));
    },
    [data, validate]
  );

  const isValid = data.email.trim().length > 0 && data.password.length > 0;

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