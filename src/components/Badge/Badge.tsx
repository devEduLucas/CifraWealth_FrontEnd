export type BadgeVariant = 'teal' | 'sky' | 'red' | 'slate' | 'amber';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  teal: 'bg-teal-500/15 text-teal-400',
  sky: 'bg-sky-500/15 text-sky-400',
  red: 'bg-red-500/15 text-red-400',
  slate: 'bg-slate-500/15 text-slate-300',
  amber: 'bg-amber-500/15 text-amber-400',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANT_CLASSES[variant]}`}>
      {label}
    </span>
  );
}
