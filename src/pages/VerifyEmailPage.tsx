import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, MailCheck, ShieldAlert } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { Footer } from '../components/Footer/Footer';

type VerificationStatus = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Estamos validando o link de confirmação.');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setStatus('error');
      setMessage('O link de confirmação está incompleto ou não é válido.');
      return () => {
        cancelled = true;
      };
    }

    setStatus('loading');
    api.verifyEmail(token)
      .then((result) => {
        if (!cancelled) {
          setStatus('success');
          setMessage(result.message);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus('error');
          setMessage(error instanceof ApiError ? error.message : 'Não foi possível confirmar o e-mail. Tente novamente.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setResending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const result = await api.resendVerification(email.trim());
      setResendMessage(result.message);
    } catch (error: unknown) {
      setResendError(error instanceof ApiError ? error.message : 'Não foi possível solicitar outro e-mail agora.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0B1020] text-white">
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-md rounded-2xl border border-[#202634] bg-[#121827] p-8">
          <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${status === 'error' ? 'bg-amber-400/10 text-amber-300' : 'bg-teal-400/10 text-teal-300'}`}>
            {status === 'loading' ? <LoaderCircle size={26} className="animate-spin" /> : status === 'error' ? <ShieldAlert size={26} /> : <CheckCircle2 size={26} />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {status === 'loading' ? 'Confirmando e-mail...' : status === 'success' ? 'E-mail confirmado' : 'Não foi possível confirmar'}
          </h1>
          <p role="status" className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

          {status === 'success' ? (
            <Link to="/login" className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-500 px-4 font-semibold text-[#062a2a] transition hover:bg-teal-400">
              Ir para entrar
            </Link>
          ) : status === 'error' ? (
            <>
              <form onSubmit={handleResend} className="mt-6 space-y-3">
                <label htmlFor="resend-email" className="block text-sm font-medium text-slate-300">E-mail usado no cadastro</label>
                <input
                  id="resend-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="min-h-12 w-full rounded-xl border border-[#2a3448] bg-[#1b2435] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
                />
                <button type="submit" disabled={resending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 font-semibold text-[#062a2a] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60">
                  <MailCheck size={17} />
                  {resending ? 'Solicitando...' : 'Solicitar novo link'}
                </button>
              </form>
              {resendMessage && <p role="status" className="mt-3 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-xs leading-5 text-teal-200">{resendMessage}</p>}
              {resendError && <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300">{resendError}</p>}
              <p className="mt-6 text-center text-sm text-slate-500">
                <Link to="/login" className="font-medium text-teal-400 hover:underline">Voltar para entrar</Link>
              </p>
            </>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
