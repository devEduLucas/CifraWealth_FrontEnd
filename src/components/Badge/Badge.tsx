export type BadgeVariant = 'teal' | 'sky' | 'red' | 'slate' | 'amber';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  teal: 'bg-teal-500/15 text-accent',
  sky: 'bg-sky-500/15 text-info',
  red: 'bg-red-500/15 text-danger',
  slate: 'bg-slate-500/15 text-secondary',
  amber: 'bg-amber-500/15 text-warning',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANT_CLASSES[variant]}`}>
      {label}
    </span>
  );
}
