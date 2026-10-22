import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Accessibility,
  Check,
  Contrast,
  Minus,
  Plus,
  RotateCcw,
  Underline,
  X,
} from 'lucide-react';

type TextSize = 'normal' | 'large' | 'larger';

interface AccessibilityPreferences {
  textSize: TextSize;
  highContrast: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'cifrawealth:accessibility';

function getSystemReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      textSize: saved.textSize === 'large' || saved.textSize === 'larger' ? saved.textSize : 'normal',
      highContrast: typeof saved.highContrast === 'boolean' ? saved.highContrast : defaults.highContrast,
      underlineLinks: typeof saved.underlineLinks === 'boolean' ? saved.underlineLinks : defaults.underlineLinks,
      reduceMotion: typeof saved.reduceMotion === 'boolean' ? saved.reduceMotion : defaults.reduceMotion,
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
      <span className="accessibility-setting-icon" aria-hidden="true">{icon}</span>
      <span className="accessibility-setting-copy">
        <span className="accessibility-setting-label">{label}</span>
        <span className="accessibility-setting-description">{description}</span>
      </span>
      <span className={`accessibility-toggle-indicator${pressed ? ' is-active' : ''}`} aria-hidden="true">
        {pressed ? <Check size={14} /> : null}
      </span>
    </button>
  );
}

export function AccessibilityTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(readPreferences);
  const [announcement, setAnnouncement] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    applyPreferences(preferences);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // As preferências ainda funcionam durante a sessão atual mesmo sem armazenamento local.
    }
  }, [preferences]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  function updatePreference<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setAnnouncement('Preferência de acessibilidade atualizada.');
  }

  function resetPreferences() {
    setPreferences(defaultPreferences());
    setAnnouncement('Preferências de acessibilidade restauradas para os valores padrão.');
  }

  return (
    <>
      <div className="accessibility-tools">
        <button
          ref={triggerRef}
          type="button"
          className="accessibility-tools-trigger"
          aria-expanded={isOpen}
          aria-controls={isOpen ? 'accessibility-tools-panel' : undefined}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={18} aria-hidden="true" /> : <Accessibility size={20} aria-hidden="true" />}
          <span>Acessibilidade</span>
        </button>

        {isOpen && (
          <section id="accessibility-tools-panel" className="accessibility-tools-panel" aria-labelledby="accessibility-tools-title">
            <header className="accessibility-tools-panel-header">
              <div>
                <h2 id="accessibility-tools-title">Acessibilidade</h2>
                <p>Personalize a leitura e a navegação.</p>
              </div>
              <button
                type="button"
                className="accessibility-tools-close"
                aria-label="Fechar painel de acessibilidade"
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="accessibility-tools-section">
              <h3>Tamanho do texto</h3>
              <div className="accessibility-text-size-options" role="group" aria-label="Tamanho do texto">
                <button type="button" aria-pressed={preferences.textSize === 'normal'} onClick={() => updatePreference('textSize', 'normal')}>
                  <Minus size={14} aria-hidden="true" /> Padrão
                </button>
                <button type="button" aria-pressed={preferences.textSize === 'large'} onClick={() => updatePreference('textSize', 'large')}>
                  <span aria-hidden="true">A</span><Plus size={12} aria-hidden="true" /> Grande
                </button>
                <button type="button" aria-pressed={preferences.textSize === 'larger'} onClick={() => updatePreference('textSize', 'larger')}>
                  <span className="accessibility-text-size-xl" aria-hidden="true">A</span><Plus size={12} aria-hidden="true" /> Maior
                </button>
              </div>
            </div>

            <div className="accessibility-tools-section">
              <ToggleSetting
                label="Alto contraste"
                description="Reforça o contraste de textos e controles."
                pressed={preferences.highContrast}
                onClick={() => updatePreference('highContrast', !preferences.highContrast)}
                icon={<Contrast size={18} />}
              />
              <ToggleSetting
                label="Sublinhar links"
                description="Destaca links sem depender apenas da cor."
                pressed={preferences.underlineLinks}
                onClick={() => updatePreference('underlineLinks', !preferences.underlineLinks)}
                icon={<Underline size={18} />}
              />
              <ToggleSetting
                label="Reduzir movimentos"
                description="Minimiza animações e rolagem suave."
                pressed={preferences.reduceMotion}
                onClick={() => updatePreference('reduceMotion', !preferences.reduceMotion)}
                icon={<Accessibility size={18} />}
              />
            </div>

            <div className="accessibility-tools-footer">
              <button type="button" onClick={resetPreferences} className="accessibility-reset-button">
                <RotateCcw size={15} aria-hidden="true" /> Restaurar padrão
              </button>
              <a href="https://vlibras.gov.br/app/" target="_blank" rel="noreferrer noopener">
                Ajuda do VLibras ↗
              </a>
            </div>
          </section>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </>
  );
}
