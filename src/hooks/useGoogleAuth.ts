import { useEffect, useRef } from 'react';
import { api, ApiError } from '../lib/api';
import { session } from '../lib/session';
import { isDemoMode } from '../lib/config';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
export type GoogleButtonText = 'signin_with' | 'signup_with';

function waitForGoogleScript(callback: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);
  if (window.google?.accounts?.id) {
    cleanup = callback();
    return () => cleanup?.();
  }
  const intervalId = window.setInterval(() => {
    if (window.google?.accounts?.id) {
      window.clearInterval(intervalId);
      cleanup = callback();
    }
  }, 100);
  return () => { window.clearInterval(intervalId); cleanup?.(); };
}

export function useGoogleAuth(onSuccess: () => void, onError: (message: string) => void, buttonText: GoogleButtonText) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);

  successRef.current = onSuccess;
  errorRef.current = onError;

  useEffect(() => {
    if (isDemoMode || !GOOGLE_CLIENT_ID) {
      const container = googleButtonRef.current;
      if (!container) return;
      container.replaceChildren();

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.disabled = !isDemoMode;
      btn.title = isDemoMode ? 'Acessar dados fictícios' : 'Use seu e-mail e senha para entrar.';
      btn.className =
        'w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#2a3448] bg-[#1a2233] text-sm font-medium text-slate-200 hover:bg-[#202b40] transition disabled:cursor-not-allowed disabled:opacity-60';
      btn.textContent = isDemoMode ? 'Entrar na demonstração' : 'Google indisponível';
      btn.onclick = () => {
        if (!isDemoMode) return;
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
