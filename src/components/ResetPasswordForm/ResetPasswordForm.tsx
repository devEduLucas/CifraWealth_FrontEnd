import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import { PrimaryButton } from '../PrimaryButton/PrimaryButton';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
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
  } = useResetPasswordForm(token ?? undefined);


  // Caso o usuário tente acessar sem um token na URL
  if (!token) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm text-center">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-warning/15 text-warning mb-4">
          <AlertTriangle size={30} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Link inválido ou expirado</h1>
        <p className="mt-2 text-sm text-secondary leading-relaxed">
          O link de redefinição de senha não possui um token válido ou já expirou. Solicite um novo link para continuar.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/forgot-password"
            className="w-full rounded-xl bg-accent py-3 text-center text-sm font-bold text-on-accent hover:bg-accent/90 transition-colors"
          >
            Solicitar novo link
          </Link>
          <Link
            to="/login"
            className="w-full text-center text-xs font-semibold text-muted hover:text-foreground py-2 transition-colors"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  // Estado de Sucesso
  if (isSuccess) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm text-center animate-in fade-in duration-300">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-positive/10 text-positive mb-5">
          <CheckCircle2 size={32} />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Senha alterada com sucesso!</h1>
        <p className="mt-2 text-sm text-secondary leading-relaxed">
          Sua nova senha foi atualizada com sucesso. Agora você já pode entrar na sua conta com a nova credencial.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full rounded-xl bg-accent py-3.5 text-center text-sm font-extrabold text-on-accent hover:bg-accent/90 transition-colors shadow-md shadow-accent/15"
          >
            Fazer login agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
      <h1 className="text-[28px] font-bold text-foreground">Criar nova senha</h1>
      <p className="mt-1.5 text-sm text-muted">
        {email ? (
          <>
            Redefinindo senha para <strong className="text-foreground">{email}</strong>.
          </>
        ) : (
          'Escolha uma nova senha forte para acessar sua conta.'
        )}
      </p>

      {submitError && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {submitError}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit()} noValidate>
        <div>
          <PasswordInput
            id="reset-password"
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            aria-describedby={touched.password && Boolean(data.password) ? "reset-password-strength" : undefined}
            autoComplete="new-password"
            value={data.password}
            onChange={(event) => setField('password', event.target.value)}
            onBlur={() => setFieldTouched('password')}
            error={touched.password ? errors.password : undefined}
          />
          <PasswordStrengthIndicator
            id="reset-password-strength"
            strength={passwordStrength}
            visible={touched.password && Boolean(data.password)}
          />
        </div>

        <PasswordInput
          label="Confirmar nova senha"
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          value={data.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          onBlur={() => setFieldTouched('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        />

        <PrimaryButton disabled={!isValid || submitting}>
          {submitting ? 'Salvando nova senha...' : 'Salvar nova senha'}
        </PrimaryButton>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Cancelar e voltar ao login
        </Link>
      </div>
    </div>
  );
}
