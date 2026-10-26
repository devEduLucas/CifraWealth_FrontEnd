import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { AccountAccessLayout } from '../components/Layout/AccountAccessLayout';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  return <EmailConfirmation key={token ?? 'missing-token'} token={token} />;
}

function EmailConfirmation({ token }: { token: string | null }) {
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timeout = window.setTimeout(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || confirming) return;
    setConfirming(true);
    setError(null);
    try {
      const result = await api.verifyEmail(token, password);
      setSuccess(result.message);
      setPassword('');
    } catch (cause: unknown) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível confirmar o e-mail. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const result = await api.resendVerification(email.trim());
      setResendMessage(result.message);
      setResendCooldown(60);
    } catch (cause: unknown) {
      setResendError(cause instanceof ApiError ? cause.message : 'Não foi possível solicitar outro e-mail agora.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AccountAccessLayout
      title={success ? 'Tudo pronto para começar.' : 'Só falta confirmar seu e-mail.'}
      description={success ? 'Seu e-mail foi confirmado. Entre para começar a organizar seus registros.' : 'Esta etapa confirma que você tem acesso ao endereço usado no cadastro. Tenha em mãos a senha que acabou de criar.'}
    >
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div className={'mb-5 flex h-12 w-12 items-center justify-center rounded-xl ' + (success ? 'bg-positive/10 text-positive' : 'bg-accent/10 text-accent-ink')}>
            {success ? <CheckCircle2 size={26} /> : <MailCheck size={26} />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{success ? 'E-mail confirmado' : 'Confirme seu e-mail'}</h1>
          {success ? (
            <>
              <p role="status" className="mt-3 text-sm leading-6 text-muted">{success}</p>
              <Link to="/login" className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-accent px-4 font-semibold text-on-accent transition-colors hover:bg-accent-hover">Entrar na minha conta</Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">
                {token ? 'Informe a senha que você criou ao solicitar este cadastro. Depois, você poderá entrar na sua conta.' : 'O link de confirmação está incompleto. Solicite outra mensagem abaixo.'}
              </p>
              {token && (
                <form onSubmit={handleConfirm} className="mt-6 space-y-4">
                  <PasswordInput label="Senha cadastrada" required minLength={8} autoComplete="current-password" disabled={confirming} value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button type="submit" disabled={confirming} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-4 font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60">
                    {confirming ? 'Confirmando...' : 'Confirmar e-mail'}
                  </button>
                  {error && <p role="alert" className="text-sm text-danger">{error}</p>}
                </form>
              )}
              <details open={!token} className="mt-6 border-t border-line pt-4">
                <summary className="cursor-pointer rounded-lg py-2 text-sm font-medium text-secondary hover:text-foreground">Problemas com o link?</summary>
                <form onSubmit={handleResend} className="mt-3 space-y-3">
                  <p className="text-sm leading-6 text-muted">Se o link expirou ou a mensagem não chegou, solicite outra para o mesmo endereço.</p>
                  <label htmlFor="resend-email" className="block text-sm font-medium text-secondary">E-mail usado no cadastro</label>
                  <input id="resend-email" type="email" required autoComplete="email" disabled={resending} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="min-h-12 w-full rounded-xl border border-field-border bg-elevated px-4 text-sm text-foreground" />
                  <button type="submit" disabled={resending || resendCooldown > 0} className="min-h-12 w-full rounded-xl border border-accent/40 px-4 font-semibold text-accent-ink disabled:opacity-60">
                    {resending ? 'Solicitando...' : resendCooldown > 0 ? `Solicitar novamente em ${resendCooldown}s` : 'Solicitar novo link'}
                  </button>
                </form>
                {resendMessage && <p role="status" className="mt-3 text-sm text-positive">{resendMessage}</p>}
                {resendError && <p role="alert" className="mt-3 text-sm text-danger">{resendError}</p>}
                <p className="mt-4 text-sm"><Link to="/register" className="text-accent-ink hover:underline">Precisa corrigir o e-mail ou a senha? Refazer cadastro</Link></p>
              </details>
              <p className="mt-5 text-center text-sm"><Link to="/login" className="text-accent-ink hover:underline">Voltar para entrar</Link></p>
            </>
          )}
        </section>
    </AccountAccessLayout>
  );
}
