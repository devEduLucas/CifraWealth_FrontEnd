import { useEffect, useRef } from 'react';
import { api, ApiError } from '../lib/api';
import { session } from '../lib/session';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
export type GoogleButtonText = 'signin_with' | 'signup_with';

function waitForGoogleScript(callback: () => void): () => void {
  if (window.google?.accounts?.id) {
    callback();
    return () => {};
  }
  const intervalId = window.setInterval(() => {
    if (window.google?.accounts?.id) {
      window.clearInterval(intervalId);
      callback();
    }
  }, 100);
  return () => window.clearInterval(intervalId);
}

export function useGoogleAuth(onSuccess: () => void, onError: (message: string) => void, buttonText: GoogleButtonText) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  successRef.current = onSuccess;
  errorRef.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      const container = googleButtonRef.current;
      if (!container) return;
      container.replaceChildren();

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2a3448] bg-[#1a2233] text-sm font-medium text-slate-200 hover:bg-[#202b40] transition cursor-pointer';
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg><span>${buttonText === 'signup_with' ? 'Cadastrar com o Google' : 'Entrar com o Google'}</span>`;
      btn.onclick = () => {
        api
          .googleLogin('mock-google-token')
          .then((auth) => {
            session.save(auth.token, auth.user);
            successRef.current();
          })
          .catch((error: unknown) =>
            errorRef.current(error instanceof ApiError ? error.message : 'Erro ao entrar com Google.')
          );
      };
      container.appendChild(btn);
      return;
    }

    return waitForGoogleScript(() => {
      const container = googleButtonRef.current;
      const google = window.google;
      if (!container || !google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            errorRef.current('O Google não retornou uma credencial válida. Tente novamente.');
            return;
          }
          api
            .googleLogin(response.credential)
            .then((auth) => {
              session.save(auth.token, auth.user);
              successRef.current();
            })
            .catch((error: unknown) =>
              errorRef.current(error instanceof ApiError ? error.message : 'Erro ao entrar com Google.')
            );
        },
      });

      const render = () => {
        const width = Math.min(Math.floor(container.getBoundingClientRect().width), 400);
        if (width <= 0) return;
        container.replaceChildren();
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: buttonText,
          shape: 'rectangular',
          logo_alignment: 'left',
          locale: 'pt-BR',
          width,
        });
      };

      render();
      const observer = new ResizeObserver(render);
      observer.observe(container);
      return () => observer.disconnect();
    });
  }, [buttonText]);

  return { googleButtonRef };
}