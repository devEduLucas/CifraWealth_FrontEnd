import { useCallback, useState } from 'react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginForm } from '../../hooks/useLoginForm';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { GoogleIcon } from '../icons/GoogleIcon';
import { SocialButton } from '../SocialButton/SocialButton';

export function LoginForm() {
  const navigate = useNavigate();
  const { data, errors, touched, setField, setFieldTouched, handleSubmit, isValid, submitting, submitError } =
    useLoginForm();

  const [googleError, setGoogleError] = useState<string | null>(null);
  const handleGoogleSuccess = useCallback(() => navigate('/dashboard'), [navigate]);
  const { hiddenButtonRef, triggerGoogleSignIn } = useGoogleAuth(handleGoogleSuccess, setGoogleError);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#202634] bg-[#121827] p-8">
      <h1 className="text-[28px] font-bold text-white">Entrar</h1>
      <p className="mt-1.5 text-sm text-slate-400">Acesse sua conta para continuar.</p>

      {submitError && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {submitError}
        </p>
      )}

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(() => navigate('/dashboard'))}
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
        <span className="h-px flex-1 bg-[#202634]" />
        <span className="text-xs text-slate-500">ou</span>
        <span className="h-px flex-1 bg-[#202634]" />
      </div>

      <SocialButton icon={<GoogleIcon />} onClick={triggerGoogleSignIn}>
        Entrar com Google
      </SocialButton>
      {googleError && <p className="mt-2 text-center text-xs text-red-400">{googleError}</p>}
      <div className="h-0 w-0 overflow-hidden">
        <div ref={hiddenButtonRef} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Não possui conta?{' '}
        <Link to="/register" className="font-medium text-teal-400 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
