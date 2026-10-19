export type BadgeVariant = 'teal' | 'positive' | 'sky' | 'red' | 'slate' | 'amber';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  teal: 'bg-progress/10 text-progress',
  positive: 'bg-positive/10 text-positive',
  sky: 'bg-info/15 text-info',
  red: 'bg-danger/15 text-danger',
  slate: 'bg-slate-500/15 text-secondary',
  amber: 'bg-warning/15 text-warning',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANT_CLASSES[variant]}`}>
      {label}
    </span>
  );
}
