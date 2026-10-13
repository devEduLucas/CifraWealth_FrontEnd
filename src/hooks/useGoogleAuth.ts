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

/**
 * Renderiza o botão oficial do Google dentro do espaço visível destinado a ele.
 * O fluxo de autenticação é iniciado pelo clique real no botão do Google — não
 * por um clique sintético em um elemento oculto.
 */
export function useGoogleAuth(
  onSuccess: () => void,
  onError: (message: string) => void,
  buttonText: GoogleButtonText
) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID não configurado — login com Google desabilitado.');
      onError('Login com Google indisponível no momento.');
      return;
    }

    return waitForGoogleScript(() => {
      const buttonContainer = googleButtonRef.current;
      const google = window.google;
      if (!buttonContainer || !google?.accounts?.id) return;

      // Evita acumular botões se o efeito for executado novamente em desenvolvimento.
      buttonContainer.replaceChildren();

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!response.credential) {
            onError('O Google não retornou uma credencial válida. Tente novamente.');
            return;
          }

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

      const availableWidth = Math.floor(buttonContainer.getBoundingClientRect().width);
      google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: buttonText,
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'pt-BR',
        width: availableWidth > 0 ? availableWidth : 320,
      });
    });
  }, [buttonText, onError, onSuccess]);

  return { googleButtonRef };
}
