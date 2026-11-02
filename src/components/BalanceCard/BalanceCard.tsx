import { formatCurrency } from '../../utils/validation';

interface BalanceCardProps {
  total: number;
  valuesVisible?: boolean;
}

export function BalanceCard({ total, valuesVisible = true }: BalanceCardProps) {
  const amountLabel = valuesVisible ? formatCurrency(total) : 'R$ ••••••';

  return (
    <section aria-label="Saldo acumulado dos registros" className="finance-hero rounded-2xl p-5 sm:p-6">
      <p className="hero-muted text-sm font-medium">Saldo acumulado dos registros</p>

      <p aria-label={valuesVisible ? undefined : 'Saldo oculto'} style={{ fontSize: `clamp(1rem, calc((100vw - 6rem) / ${amountLabel.length * 0.65}), 2.75rem)` }} className={`mt-1 whitespace-nowrap font-bold tabular-nums tracking-tight ${valuesVisible && total < 0 ? 'hero-negative' : 'hero-ink'}`}>
        {amountLabel}
      </p>

      <p className="hero-muted mt-1 text-xs">Receitas menos despesas confirmadas até hoje.</p>
      <details className="hero-muted mt-3 text-xs">
        <summary className="hero-ink w-fit cursor-pointer rounded py-1 font-semibold focus-visible:outline focus-visible:outline-2">Entenda este saldo</summary>
        <p className="mt-2 max-w-xl leading-relaxed">Calculado com todos os registros que você adicionou aqui. Não consulta seu banco e não desconta o dinheiro reservado nas metas. Pendências e movimentações futuras ficam fora deste saldo.</p>
      </details>
    </section>
  );
}
