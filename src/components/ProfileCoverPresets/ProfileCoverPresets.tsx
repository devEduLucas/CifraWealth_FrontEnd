import { useMemo, useState } from 'react';
import { Check, Palette } from 'lucide-react';

const PRESETS = [
  { name: 'Azul Cifra', colors: ['#102c57', '#2563eb'] },
  { name: 'Oceano', colors: ['#104450', '#21a6a1'] },
  { name: 'Horizonte', colors: ['#283764', '#8b9acb'] },
  { name: 'Grafite', colors: ['#1e293b', '#64748b'] },
  { name: 'Areia', colors: ['#82674e', '#dbc5a5'] },
  { name: 'Azul sólido', colors: ['#2357a5', '#2357a5'] },
] as const;

// Same JPEG contract as an uploaded cover: no additional field or migration.
function makeCover(start: string, end = start) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx)
    throw new Error('Não foi possível criar a capa. Tente enviar uma imagem.');
  const gradient = ctx.createLinearGradient(0, 320, 1280, 0);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1280, 320);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export function ProfileCoverPresets({
  image,
  disabled,
  onSelect,
}: {
  image: string | null;
  disabled: boolean;
  onSelect: (image: string) => void;
}) {
  const [color, setColor] = useState('#2357a5');
  const [error, setError] = useState('');
  const options = useMemo(
    () =>
      PRESETS.map((preset) => {
        try {
          return {
            ...preset,
            image: makeCover(preset.colors[0], preset.colors[1]),
          };
        } catch {
          return { ...preset, image: '' };
        }
      }),
    [],
  );

  function chooseColor(value: string) {
    setColor(value);
    try {
      onSelect(makeCover(value));
      setError('');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível criar a capa.',
      );
    }
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium text-muted">
        Escolha um fundo pronto
      </p>
      <div
        role="group"
        aria-label="Fundos prontos para a capa"
        className="grid grid-cols-2 gap-2 min-[440px]:grid-cols-3"
      >
        {options.map((preset) => (
          <button
            key={preset.name}
            type="button"
            disabled={disabled || !preset.image}
            aria-label={`Capa ${preset.name}`}
            aria-pressed={Boolean(preset.image) && image === preset.image}
            onClick={() => onSelect(preset.image)}
            className={`min-w-0 rounded-xl border p-1.5 text-left disabled:opacity-40 ${image === preset.image ? 'border-accent bg-accent/10' : 'border-line hover:bg-hover'}`}
          >
            <span
              aria-hidden="true"
              className="flex h-10 items-center justify-end rounded-lg p-2"
              style={{
                background: `linear-gradient(100deg, ${preset.colors.join(',')})`,
              }}
            >
              {image === preset.image && (
                <span className="rounded-full bg-surface p-0.5 text-foreground">
                  <Check size={15} />
                </span>
              )}
            </span>
            <span className="mt-1.5 block text-xs font-medium text-foreground">
              {preset.name}
            </span>
          </button>
        ))}
      </div>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-xs font-medium text-foreground">
        <Palette size={16} aria-hidden="true" className="text-accent-ink" />
        Escolher cor da capa
        <input
          type="color"
          value={color}
          disabled={disabled}
          onChange={(event) => chooseColor(event.target.value)}
          className="ml-auto h-8 w-10 cursor-pointer rounded border border-line bg-transparent p-0.5"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">
        Ou envie uma imagem abaixo. Salve para aplicar a capa.
      </p>
    </div>
  );
}
