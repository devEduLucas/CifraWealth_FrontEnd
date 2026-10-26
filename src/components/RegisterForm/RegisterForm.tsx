import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mail, RefreshCw, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { api, ApiError } from '../../lib/api';
import { Input } from '../Input/Input';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import { Checkbox } from '../Checkbox/Checkbox';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';

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
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [correctingEmail, setCorrectingEmail] = useState(false);
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null);
  const handleGoogleSuccess = useCallback(() => navigate('/dashboard', { replace: true }), [navigate]);
  const { googleButtonRef } = useGoogleAuth(handleGoogleSuccess, setGoogleError, 'signup_with', !verificationEmail);

  useEffect(() => {
    if (verificationEmail) confirmationHeadingRef.current?.focus();
  }, [verificationEmail]);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timeout = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  function handleRegistrationSent(email: string) {
    setVerificationEmail(email);
    setCorrectingEmail(false);
    setResendCooldown(60);
    setResendMessage(null);
    setResendError(null);
  }

  function handleCorrectEmail() {
    setVerificationEmail(null);
    setCorrectingEmail(true);
    setField('password', '');
    setField('confirmPassword', '');
    setResendMessage(null);
    setResendError(null);
    setGoogleError(null);
    window.requestAnimationFrame(() => document.getElementById('register-email')?.focus());
  }

  function handleBlockedGoogleClick(): void {
    setFieldTouched('acceptTerms');
    setGoogleError('Aceite os Termos de Uso e a Política de Privacidade para continuar.');
  }

  async function handleResendVerification(): Promise<void> {
    if (!verificationEmail || resending || resendCooldown > 0) return;
    setResending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const result = await api.resendVerification(verificationEmail);
      setResendMessage(result.message);
      setResendCooldown(60);
    } catch (error: unknown) {
      setResendError(error instanceof ApiError ? error.message : 'Não foi possível solicitar outro e-mail agora.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-card auth-register w-full max-w-lg rounded-2xl border border-line bg-surface p-5 sm:p-6">
      {verificationEmail ? (
        <>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
            <CheckCircle2 size={26} />
          </div>
          <h1 ref={confirmationHeadingRef} tabIndex={-1} className="text-[28px] font-bold text-foreground">Confira sua caixa de entrada</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enviamos a confirmação para <strong className="break-words font-medium text-secondary">{verificationEmail}</strong>.
          </p>

          <ol className="mt-5 space-y-3 rounded-xl border border-line bg-elevated/60 p-4 text-sm leading-6 text-secondary">
            <li><span className="mr-2 font-bold text-accent-ink">1.</span>Abra a mensagem da CifraWealth, incluindo a pasta de spam.</li>
            <li><span className="mr-2 font-bold text-accent-ink">2.</span>Clique em <strong>Confirmar e-mail</strong> e informe a senha que acabou de criar.</li>
            <li><span className="mr-2 font-bold text-accent-ink">3.</span>Depois da confirmação, entre na sua conta.</li>
          </ol>
          <p className="mt-3 text-xs text-muted">O link de confirmação é válido por 24 horas.</p>

          <Link to="/login" className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover">
            Já confirmei — entrar
          </Link>

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending || resendCooldown > 0}
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-secondary transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={resending ? 'animate-spin' : undefined} />
            {resending ? 'Solicitando...' : resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Não recebeu? Reenviar confirmação'}
          </button>

          {resendMessage && (
            <p role="status" className="mt-3 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs leading-5 text-accent-ink">
              {resendMessage}
            </p>
          )}
          {resendError && (
            <p role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-5 text-danger">
              {resendError}
            </p>
          )}

          <button type="button" onClick={handleCorrectEmail} className="mt-2 min-h-11 w-full rounded-xl px-3 text-sm text-muted hover:bg-hover hover:text-foreground">
            Corrigir endereço de e-mail
          </button>
        </>
      ) : (
        <>
          <h1 className="text-[28px] font-bold leading-tight text-foreground">Criar conta</h1>
          <p className="mt-1.5 text-sm text-muted">
            <span className="text-secondary">Comece gratuitamente.</span> Sem cartão de crédito.
          </p>
          {correctingEmail && <p role="status" className="mt-3 text-sm leading-6 text-secondary">Confira o endereço e informe sua senha novamente para enviar outra confirmação.</p>}

          {submitError && (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {submitError}
            </p>
          )}

          <form
            className="auth-form mt-4 flex flex-col gap-3"
            onSubmit={handleSubmit(handleRegistrationSent)}
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
              id="register-email"
              label="E-mail"
              type="email"
              icon={<Mail size={18} />}
              placeholder="seu@email.com"
              autoComplete="email"
              value={data.email}
              onChange={(event) => setField('email', event.target.value)}
              onBlur={() => setFieldTouched('email')}
              error={touched.email ? errors.email : undefined}
              helperText="Você receberá um link e usará a senha criada aqui para confirmar a conta."
            />

            <div>
              <PasswordInput
                id="register-password"
                label="Senha"
                placeholder="Mínimo 8 caracteres"
                aria-describedby={data.password.length > 0 ? "register-password-strength" : undefined}
                autoComplete="new-password"
                value={data.password}
                onChange={(event) => setField('password', event.target.value)}
                onBlur={() => setFieldTouched('password')}
                error={touched.password ? errors.password : undefined}
              />
              <PasswordStrengthIndicator id="register-password-strength" strength={strength} visible={data.password.length > 0} />
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
              onChange={(event) => {
                setField('acceptTerms', event.target.checked);
                if (event.target.checked) setGoogleError(null);
              }}
              onBlur={() => setFieldTouched('acceptTerms')}
              error={touched.acceptTerms ? errors.acceptTerms : undefined}
              label={
                <>
                  Aceito os{' '}
                  <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-accent-ink hover:underline" aria-label="Termos de Uso (abre em nova aba)">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-accent-ink hover:underline" aria-label="Política de Privacidade (abre em nova aba)">
                    Política de Privacidade
                  </a>
                </>
              }
            />

            <PrimaryButton disabled={!isValid || submitting}>
              {submitting ? 'Criando conta...' : 'Criar conta'}
            </PrimaryButton>
          </form>

          <div className="auth-divider my-3 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-subtle">ou</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className={`auth-provider relative flex min-h-12 w-full items-center justify-center overflow-hidden ${!data.acceptTerms ? 'opacity-60' : ''}`}>
            <div ref={googleButtonRef} className="w-full max-w-[400px]" />
            {!data.acceptTerms && (
              <button
                type="button"
                aria-label="Cadastrar com Google — aceite os termos primeiro"
                onClick={handleBlockedGoogleClick}
                className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              />
            )}
          </div>
          {googleError && <p role="alert" className="mt-2 text-center text-xs text-danger">{googleError}</p>}

          <p className="auth-switch mt-3 text-center text-sm text-subtle">
            Já possui conta?{' '}
            <Link to="/login" className="font-medium text-accent-ink hover:underline">
              Entrar
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
