import { ArrowDownRight, ArrowUpRight, Check, Plus, Target } from 'lucide-react';

interface AuthFinancialIllustrationProps {
  variant: 'register' | 'login';
}

export function AuthFinancialIllustration({ variant }: AuthFinancialIllustrationProps) {
  const registering = variant === 'register';

  return (
    <div className="auth-scene" data-illustration={variant}>
      <div className="auth-scene-glow" />

      <div className="auth-scene-main border border-line-strong bg-surface shadow-xl shadow-black/10">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {registering ? 'Meu primeiro planejamento' : 'Meu painel financeiro'}
        </div>

        {registering ? (
          <>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-positive/10 text-positive"><ArrowUpRight size={19} /></span>
              <div>
                <p className="text-[11px] text-muted">Receita · Salário</p>
                <p className="text-xl font-bold text-foreground">R$ 3.200<span className="text-sm">,00</span></p>
              </div>
            </div>
            <div className="auth-scene-detail mt-3 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger"><ArrowDownRight size={19} /></span>
              <div>
                <p className="text-[11px] text-muted">Despesa · Moradia</p>
                <p className="text-base font-semibold text-foreground">R$ 1.200,00</p>
              </div>
            </div>
            <div className="auth-scene-expanded mt-4 rounded-xl bg-elevated p-3">
              <p className="text-[11px] text-muted">Resultado do mês</p>
              <p className="mt-1 text-lg font-bold text-positive">R$ 2.000,00</p>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[11px] text-muted">Saldo dos lançamentos</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">R$ 2.450<span className="text-base">,00</span></p>
            <div className="auth-scene-detail mt-3 gap-4">
              <div><p className="text-[10px] text-muted">Receitas</p><p className="text-xs font-semibold text-positive">R$ 4.000,00</p></div>
              <div><p className="text-[10px] text-muted">Despesas</p><p className="text-xs font-semibold text-danger">R$ 1.550,00</p></div>
            </div>
            <div className="auth-scene-expanded mt-4">
              <p className="text-[10px] text-muted">Sua evolução</p>
              <svg viewBox="0 0 240 70" className="mt-2 h-16 w-full text-accent-ink" fill="none" aria-hidden="true">
                <path d="M2 62H238M2 34H238M2 6H238" stroke="currentColor" opacity="0.1" />
                <path d="M2 57L40 45L78 49L116 29L154 34L192 15L238 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-muted"><span>Mar</span><span>Abr</span><span>Mai</span></div>
            </div>
          </>
        )}
      </div>

      <div className="auth-scene-note flex items-center gap-1.5 border border-line-strong bg-elevated text-xs font-medium text-foreground shadow-lg shadow-black/10">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${registering ? 'bg-accent/10 text-accent-ink' : 'bg-positive/10 text-positive'}`}>
          {registering ? <Plus size={14} /> : <Check size={14} />}
        </span>
        {registering ? 'Primeiro lançamento' : 'Registros em dia'}
      </div>

      <div className="auth-scene-goal border border-line-strong bg-elevated shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-progress/10 text-progress"><Target size={18} /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{registering ? 'Sua primeira meta' : 'Reserva de emergência'}</p>
            <p className="mt-0.5 text-[10px] text-muted">{registering ? 'Comece a guardar' : 'R$ 7.500 de R$ 10.000'}</p>
          </div>
        </div>
        <div className="mt-2 h-1 rounded-full bg-line"><div className={`h-full rounded-full bg-progress ${registering ? 'w-[15%]' : 'w-3/4'}`} /></div>
      </div>

      <p className="auth-scene-caption text-[10px] text-subtle">Exemplo ilustrativo</p>
    </div>
  );
}
