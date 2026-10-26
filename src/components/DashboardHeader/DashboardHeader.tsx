import { FinancialPrivacyButton } from '../FinancialPrivacyButton/FinancialPrivacyButton';

interface DashboardHeaderProps {
  firstName: string;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {firstName}</h1>
        <p className="mt-0.5 text-sm text-muted">Seu controle financeiro, em um só lugar.</p>
      </div>
      <FinancialPrivacyButton />
    </div>
  );
}
