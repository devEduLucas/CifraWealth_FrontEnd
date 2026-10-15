interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {firstName}</h1>
        <p className="mt-0.5 text-sm text-muted">Bem-vindo de volta.</p>
      </div>

    </div>
  );
}
