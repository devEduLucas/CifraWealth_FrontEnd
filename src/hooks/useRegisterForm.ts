import { useCallback, useState } from 'react';
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
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setFieldTouched = useCallback((field: keyof RegisterFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = validateRegisterForm(data);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [data]);

  const handleSubmit = useCallback(
    (onSuccess: (userId: number) => void) => (event: FormEvent) => {
      event.preventDefault();
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        acceptTerms: true,
      });
      setSubmitError(null);
      if (!validate()) return;

      setSubmitting(true);
      api
        .register({ fullName: data.fullName, email: data.email, password: data.password })
        .then((user) => onSuccess(user.id_usuario))
        .catch((error: unknown) => {
          setSubmitError(error instanceof ApiError ? error.message : 'Erro de conexão com o servidor.');
        })
        .finally(() => setSubmitting(false));
    },
    [data, validate]
  );

  const isValid =
    isRequiredValid(data.fullName) &&
    isRequiredValid(data.email) &&
    data.password.length >= 8 &&
    data.password === data.confirmPassword &&
    data.acceptTerms;

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

function isRequiredValid(value: string): boolean {
  return value.trim().length > 0;
}
