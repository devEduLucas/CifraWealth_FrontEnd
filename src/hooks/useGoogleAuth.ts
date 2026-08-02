import { useEffect, useRef } from 'react';
import { api, ApiError } from '../lib/api';
import { session } from '../lib/session';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

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

export function useGoogleAuth(onSuccess: () => void, onError: (message: string) => void) {
  const hiddenButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID não configurado — login com Google desabilitado.');
      return;
    }

    return waitForGoogleScript(() => {
      if (!hiddenButtonRef.current || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          api
            .googleLogin(response.credential)
            .then((auth) => {
              session.save(auth.token, auth.user);
              onSuccess();
            })
            .catch((error: unknown) => {
              onError(error instanceof ApiError ? error.message : 'Erro ao entrar com Google.');
            });
        },
      });

      window.google.accounts.id.renderButton(hiddenButtonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        width: 320,
      });
    });
  }, [onSuccess, onError]);

  function triggerGoogleSignIn(): void {
    const realButton = hiddenButtonRef.current?.querySelector<HTMLElement>('div[role="button"]');
    if (realButton) {
      realButton.click();
    } else {
      onError('Login com Google ainda carregando. Tente novamente em instantes.');
    }
  }

  return { hiddenButtonRef, triggerGoogleSignIn };
}