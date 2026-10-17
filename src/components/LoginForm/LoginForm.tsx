import { useCallback, useState } from 'react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginForm } from '../../hooks/useLoginForm';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';

export function LoginForm() {
  const navigate = useNavigate();
  const { data, errors, touched, setField, setFieldTouched, handleSubmit, isValid, submitting, submitError } =
    useLoginForm();

  const [googleError, setGoogleError] = useState<string | null>(null);
  const handleGoogleSuccess = useCallback(() => navigate('/dashboard', { replace: true }), [navigate]);
  const { googleButtonRef } = useGoogleAuth(handleGoogleSuccess, setGoogleError, 'signin_with');

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8">
      <h1 className="text-[28px] font-bold text-foreground">Entrar</h1>
      <p className="mt-1.5 text-sm text-muted">Acesse sua conta para continuar.</p>

      {submitError && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </p>
      )}

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(() => navigate('/dashboard', { replace: true }))}
        noValidate
      >
        <Input
          label="E-mail"
          type="email"
          icon={<Mail size={18} />}
          placeholder="seu@email.com"
          autoComplete="email"
          value={data.email}
          onChange={(event) => setField('email', event.target.value)}
          onBlur={() => setFieldTouched('email')}
          error={touched.email ? errors.email : undefined}
        />

        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          autoComplete="current-password"
          value={data.password}
          onChange={(event) => setField('password', event.target.value)}
          onBlur={() => setFieldTouched('password')}
          error={touched.password ? errors.password : undefined}
        />

        <PrimaryButton disabled={!isValid || submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-subtle">ou</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex min-h-12 w-full items-center justify-center overflow-hidden">
        <div ref={googleButtonRef} className="w-full max-w-[400px]" />
      </div>
      {googleError && <p className="mt-2 text-center text-xs text-danger">{googleError}</p>}

      <p className="mt-6 text-center text-sm text-subtle">
        Não possui conta?{' '}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
