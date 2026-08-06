import { useCallback, useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { GoogleIcon } from '../icons/GoogleIcon';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import { Checkbox } from '../Checkbox/Checkbox';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { SocialButton } from '../SocialButton/SocialButton';

export function RegisterForm() {
  const navigate = useNavigate();
  const {
    data,
    errors,
    touched,
    setField,
    setFieldTouched,
    handleSubmit,
    isValid,
    submitting,
    submitError,
  } = useRegisterForm();
  const strength = usePasswordStrength(data.password);

  const [googleError, setGoogleError] = useState<string | null>(null);
  const handleGoogleSuccess = useCallback(() => navigate('/dashboard'), [navigate]);
  const { hiddenButtonRef, triggerGoogleSignIn } = useGoogleAuth(handleGoogleSuccess, setGoogleError);

  function handleGoogleClick(): void {
    if (!data.acceptTerms) {
      setFieldTouched('acceptTerms');
      setGoogleError('Aceite os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }
    setGoogleError(null);
    triggerGoogleSignIn();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#202634] bg-[#121827] p-8">
      <h1 className="text-[28px] font-bold text-white">Criar conta</h1>
      <p className="mt-1.5 text-sm text-slate-400">
        <span className="text-slate-300">Comece gratuitamente.</span> Sem cartão de crédito.
      </p>

      {submitError && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {submitError}
        </p>
      )}

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit(() => navigate('/login'))}
        noValidate
      >
        <Input
          label="Nome completo"
          icon={<User size={18} />}
          placeholder="Seu nome completo"
          autoComplete="name"
          value={data.fullName}
          onChange={(event) => setField('fullName', event.target.value)}
          onBlur={() => setFieldTouched('fullName')}
          error={touched.fullName ? errors.fullName : undefined}
        />

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

        <div>
          <PasswordInput
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={data.password}
            onChange={(event) => setField('password', event.target.value)}
            onBlur={() => setFieldTouched('password')}
            error={touched.password ? errors.password : undefined}
          />
          <PasswordStrengthIndicator strength={strength} visible={data.password.length > 0} />
        </div>

        <PasswordInput
          label="Confirmar senha"
          placeholder="Repita sua senha"
          autoComplete="new-password"
          value={data.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          onBlur={() => setFieldTouched('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        />

        <Checkbox
          id="accept-terms"
          checked={data.acceptTerms}
          onChange={(event) => setField('acceptTerms', event.target.checked)}
          onBlur={() => setFieldTouched('acceptTerms')}
          error={touched.acceptTerms ? errors.acceptTerms : undefined}
          label={
            <>
              Aceito os{' '}
              <a href="/termos-de-uso" className="text-teal-400 hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/politica-de-privacidade" className="text-teal-400 hover:underline">
                Política de Privacidade
              </a>
            </>
          }
        />

        <PrimaryButton disabled={!isValid || submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#202634]" />
        <span className="text-xs text-slate-500">ou</span>
        <span className="h-px flex-1 bg-[#202634]" />
      </div>

      <SocialButton
        icon={<GoogleIcon />}
        onClick={handleGoogleClick}
        className={!data.acceptTerms ? 'opacity-60' : undefined}
      >
        Cadastrar com Google
      </SocialButton>
      {googleError && <p className="mt-2 text-center text-xs text-red-400">{googleError}</p>}
      <div className="h-0 w-0 overflow-hidden">
        <div ref={hiddenButtonRef} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já possui conta?{' '}
        <Link to="/login" className="font-medium text-teal-400 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
