import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { Footer } from '../components/Footer/Footer';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

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
    if (resending) return;
    setResending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const result = await api.resendVerification(email.trim());
      setResendMessage(result.message);
    } catch (cause: unknown) {
      setResendError(cause instanceof ApiError ? cause.message : 'Não foi possível solicitar outro e-mail agora.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas text-foreground">
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8">
          <div className={'mb-5 flex h-12 w-12 items-center justify-center rounded-xl ' + (success ? 'bg-positive/10 text-positive' : 'bg-accent/10 text-accent-ink')}>
            {success ? <CheckCircle2 size={26} /> : <MailCheck size={26} />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{success ? 'E-mail confirmado' : 'Confirme seu e-mail'}</h1>
          {success ? (
            <>
              <p role="status" className="mt-3 text-sm leading-6 text-muted">{success}</p>
              <Link to="/login" className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-accent px-4 font-semibold text-on-accent transition-colors hover:bg-accent-hover">Ir para entrar</Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">
                {token ? 'Para ativar sua conta, informe a senha escolhida no cadastro que originou este link.' : 'O link de confirmação está incompleto. Solicite outro link abaixo.'}
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
              <form onSubmit={handleResend} className="mt-8 space-y-3 border-t border-line pt-5">
                <p className="text-sm text-muted">Link expirado ou não recebeu a mensagem?</p>
                <label htmlFor="resend-email" className="block text-sm font-medium text-secondary">E-mail usado no cadastro</label>
                <input id="resend-email" type="email" required autoComplete="email" disabled={resending} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" className="min-h-12 w-full rounded-xl border border-field-border bg-elevated px-4 text-sm text-foreground" />
                <button type="submit" disabled={resending} className="min-h-12 w-full rounded-xl border border-accent/40 px-4 font-semibold text-accent-ink disabled:opacity-60">
                  {resending ? 'Solicitando...' : 'Solicitar novo link'}
                </button>
              </form>
              {resendMessage && <p role="status" className="mt-3 text-sm text-positive">{resendMessage}</p>}
              {resendError && <p role="alert" className="mt-3 text-sm text-danger">{resendError}</p>}
              <p className="mt-6 text-center text-sm"><Link to="/login" className="text-accent-ink hover:underline">Voltar para entrar</Link></p>
              <p className="mt-3 text-center text-sm"><Link to="/register" className="text-muted hover:underline">Cadastrar novamente com outra senha</Link></p>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
