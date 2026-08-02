import type { PasswordStrengthResult } from '../../types/form.types';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrengthResult;
  visible: boolean;
}

const LEVEL_BAR_COLOR: Record<PasswordStrengthResult['level'], string> = {
  weak: 'bg-red-500',
  medium: 'bg-amber-500',
  strong: 'bg-emerald-400',
};

const LEVEL_LABEL_COLOR: Record<PasswordStrengthResult['level'], string> = {
  weak: 'text-red-400',
  medium: 'text-amber-400',
  strong: 'text-emerald-400',
};

export function PasswordStrengthIndicator({ strength, visible }: PasswordStrengthIndicatorProps) {
  if (!visible) {
    return null;
  }

  const bars = [0, 1, 2, 3];

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {bars.map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index < strength.score ? LEVEL_BAR_COLOR[strength.level] : 'bg-[#262F40]'
            }`}
          />
        ))}
      </div>
      {strength.label && (
        <span className="text-xs text-slate-500">
          Força da senha:{' '}
          <span className={LEVEL_LABEL_COLOR[strength.level]}>{strength.label}</span>
        </span>
      )}
    </div>
  );
}
