import { useEffect, useRef, useState } from 'react';
import { api, type DeleteAccountInput } from '../../lib/api';
import { waitForGoogleScript } from '../../hooks/useGoogleAuth';

export function GoogleAccountConfirmation({
  onVerified,
}: {
  onVerified: (proof: DeleteAccountInput) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onVerified);
  callback.current = onVerified;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    let active = true;
    let timedOut = false;
    let cleanup = () => {};
    const timeout = window.setTimeout(() => {
      timedOut = true;
      if (active) {
        setLoading(false);
        setError('O Google não carregou. Confira a conexão e tente novamente.');
      }
      cleanup();
    }, 12000);
    setLoading(true);
    setError('');
    const prepare = async () => {
      if (!clientId)
        throw new Error(
          'A confirmação com Google está temporariamente indisponível.',
        );
      const challenge = await api.accountDeletionChallenge();
      if (!active || timedOut) return;
      cleanup = waitForGoogleScript(() => {
        const google = window.google?.accounts.id;
        const element = container.current;
        if (!active || !google || !element) return;
        google.initialize({
          client_id: clientId,
          nonce: challenge.nonce,
          auto_select: false,
          callback: (response) => {
            if (active && response.credential)
              callback.current({
                googleIdToken: response.credential,
                challengeToken: challenge.challengeToken,
              });
          },
        });
        element.replaceChildren();
        google.renderButton(element, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          locale: 'pt-BR',
          width: Math.min(
            360,
            Math.floor(element.getBoundingClientRect().width),
          ),
        });
        window.clearTimeout(timeout);
        setLoading(false);
      });
    };
    prepare().catch((cause: unknown) => {
      if (active) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível preparar a confirmação.',
        );
        setLoading(false);
      }
      window.clearTimeout(timeout);
    });
    return () => {
      active = false;
      cleanup();
      window.clearTimeout(timeout);
    };
  }, [attempt]);
  return (
    <div className="mt-4">
      <div ref={container} className="flex min-h-11 w-full justify-center" />
      {loading && (
        <p role="status" className="mt-2 text-sm text-muted">
          Preparando confirmação com Google...
        </p>
      )}
      {error && (
        <div className="mt-2">
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-2 min-h-11 text-sm font-semibold text-accent-ink underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
