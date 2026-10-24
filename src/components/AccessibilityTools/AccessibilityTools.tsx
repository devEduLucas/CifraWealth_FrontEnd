import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Modal } from '../Modal/Modal';
import {
  Accessibility,
  Check,
  Contrast,
  RotateCcw,
  Underline,
} from 'lucide-react';

type TextSize = 'normal' | 'large' | 'larger';

interface AccessibilityPreferences {
  textSize: TextSize;
  highContrast: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'cifrawealth:accessibility';
const AccessibilityContext = createContext<{
  open: boolean;
  setOpen: (value: boolean) => void;
} | null>(null);

export function AccessibilityButton({
  floating = false,
}: {
  floating?: boolean;
}) {
  const context = useContext(AccessibilityContext);
  if (!context)
    throw new Error('AccessibilityButton precisa do AccessibilityProvider.');
  const button = (
    <button
      type="button"
      aria-label="Acessibilidade"
      title="Acessibilidade"
      aria-haspopup="dialog"
      aria-expanded={context.open}
      onClick={() => context.setOpen(true)}
      className={
        floating
          ? 'accessibility-tools-trigger'
          : 'flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-elevated hover:text-foreground'
      }
    >
      <Accessibility size={20} aria-hidden="true" />
      {floating && <span className="hidden sm:inline">Acessibilidade</span>}
    </button>
  );
  return floating ? (
    <div className="accessibility-tools">{button}</div>
  ) : (
    button
  );
}

function getSystemReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function defaultPreferences(): AccessibilityPreferences {
  return {
    textSize: 'normal',
    highContrast: false,
    underlineLinks: false,
    reduceMotion: getSystemReducedMotion(),
  };
}

function readPreferences(): AccessibilityPreferences {
  const defaults = defaultPreferences();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const saved = parsed as Partial<AccessibilityPreferences>;
    return {
      textSize:
        saved.textSize === 'large' || saved.textSize === 'larger'
          ? saved.textSize
          : 'normal',
      highContrast:
        typeof saved.highContrast === 'boolean'
          ? saved.highContrast
          : defaults.highContrast,
      underlineLinks:
        typeof saved.underlineLinks === 'boolean'
          ? saved.underlineLinks
          : defaults.underlineLinks,
      reduceMotion:
        typeof saved.reduceMotion === 'boolean'
          ? saved.reduceMotion
          : defaults.reduceMotion,
    };
  } catch {
    return defaults;
  }
}

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement;
  root.dataset.a11yTextSize = preferences.textSize;
  root.dataset.a11yHighContrast = String(preferences.highContrast);
  root.dataset.a11yUnderlineLinks = String(preferences.underlineLinks);
  root.dataset.a11yReducedMotion = String(preferences.reduceMotion);
}

function ToggleSetting({
  label,
  description,
  pressed,
  onClick,
  icon,
}: {
  label: string;
  description: string;
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="accessibility-setting-toggle"
    >
      <span className="accessibility-setting-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="accessibility-setting-copy">
        <span className="accessibility-setting-label">{label}</span>
        <span className="accessibility-setting-description">{description}</span>
      </span>
      <span
        className={`accessibility-toggle-indicator${pressed ? ' is-active' : ''}`}
        aria-hidden="true"
      >
        {pressed ? <Check size={14} /> : null}
      </span>
    </button>
  );
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(readPreferences);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    applyPreferences(preferences);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // As preferências ainda funcionam durante a sessão atual mesmo sem armazenamento local.
    }
  }, [preferences]);

  function updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setAnnouncement('Preferência de acessibilidade atualizada.');
  }

  function resetPreferences() {
    setPreferences(defaultPreferences());
    setAnnouncement(
      'Preferências de acessibilidade restauradas para os valores padrão.',
    );
  }

  return (
    <AccessibilityContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
      <Modal
        open={isOpen}
        title="Acessibilidade"
        onClose={() => setIsOpen(false)}
      >
        <p className="text-sm text-muted">
          Personalize a leitura e a navegação.
        </p>

        <div className="accessibility-tools-section">
          <h3>Tamanho do texto</h3>
          <div
            className="accessibility-text-size-options"
            role="group"
            aria-label="Tamanho do texto"
          >
            <button
              type="button"
              aria-pressed={preferences.textSize === 'normal'}
              onClick={() => updatePreference('textSize', 'normal')}
            >
              <span aria-hidden="true">A</span>
              <span>Padrão</span>
            </button>
            <button
              type="button"
              aria-pressed={preferences.textSize === 'large'}
              onClick={() => updatePreference('textSize', 'large')}
            >
              <span className="text-base" aria-hidden="true">
                A+
              </span>
              <span>Grande</span>
            </button>
            <button
              type="button"
              aria-pressed={preferences.textSize === 'larger'}
              onClick={() => updatePreference('textSize', 'larger')}
            >
              <span className="accessibility-text-size-xl" aria-hidden="true">
                A+
              </span>
              <span>Maior</span>
            </button>
          </div>
        </div>

        <div className="accessibility-tools-section">
          <ToggleSetting
            label="Alto contraste"
            description="Reforça o contraste de textos e controles."
            pressed={preferences.highContrast}
            onClick={() =>
              updatePreference('highContrast', !preferences.highContrast)
            }
            icon={<Contrast size={18} />}
          />
          <ToggleSetting
            label="Sublinhar links"
            description="Destaca links sem depender apenas da cor."
            pressed={preferences.underlineLinks}
            onClick={() =>
              updatePreference('underlineLinks', !preferences.underlineLinks)
            }
            icon={<Underline size={18} />}
          />
          <ToggleSetting
            label="Reduzir movimentos"
            description="Minimiza animações e rolagem suave."
            pressed={preferences.reduceMotion}
            onClick={() =>
              updatePreference('reduceMotion', !preferences.reduceMotion)
            }
            icon={<Accessibility size={18} />}
          />
        </div>

        <div className="accessibility-tools-footer">
          <button
            type="button"
            onClick={resetPreferences}
            className="accessibility-reset-button"
          >
            <RotateCcw size={15} aria-hidden="true" /> Restaurar padrão
          </button>
          <a
            href="https://vlibras.gov.br/app/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Ajuda do VLibras ↗
          </a>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </Modal>
    </AccessibilityContext.Provider>
  );
}
