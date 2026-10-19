import { CheckCircle2, Compass } from 'lucide-react';

export function HomeHowItWorks() {
  return (<section id="como-funciona" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-line">
    <div className="text-center max-w-2xl mx-auto mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-info/10 text-info text-xs font-bold uppercase tracking-wider mb-3">
        <Compass size={14} />
        <span>PASSO A PASSO</span>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
        Como funciona o CifraWealth na prática.
      </h2>
      <p className="text-secondary text-base leading-relaxed">
        Sem burocracia ou integrações invasivas. Uma metodologia direta em três passos para você ter total domínio financeiro.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      {/* Linha conectora em telas médias/grandes */}
      <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-line-strong -translate-y-8 z-0 pointer-events-none" aria-hidden="true" />

      {/* Passo 01 */}
      <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
        <div className="flex items-center justify-between mb-6">
          <span className="w-12 h-12 rounded-2xl bg-accent text-on-accent flex items-center justify-center font-extrabold text-lg shadow-md">
            1
          </span>
          <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
            Etapa Inicial
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Crie sua conta</h3>
        <p className="text-sm text-secondary leading-relaxed mb-4">
          Cadastre seu e-mail e defina suas categorias personalizadas (ou aproveite nossa estrutura pré-configurada).
        </p>
        <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
          <CheckCircle2 size={14} className="text-accent-ink" />
          <span>Confirme seu e-mail para começar</span>
        </div>
      </div>

      {/* Passo 02 */}
      <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
        <div className="flex items-center justify-between mb-6">
          <span className="w-12 h-12 rounded-2xl bg-info text-on-accent flex items-center justify-center font-extrabold text-lg shadow-md">
            2
          </span>
          <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
            Rotina
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Lance suas movimentações</h3>
        <p className="text-sm text-secondary leading-relaxed mb-4">
          Registre entradas de salário, vendas e investimentos, além de despesas do dia a dia com data e categoria.
        </p>
        <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
          <CheckCircle2 size={14} className="text-info" />
          <span>Acesso instantâneo mobile e desktop</span>
        </div>
      </div>

      {/* Passo 03 */}
      <div className="relative z-10 rounded-2xl bg-surface border border-line p-7 flex flex-col hover:border-line-strong transition-all">
        <div className="flex items-center justify-between mb-6">
          <span className="w-12 h-12 rounded-2xl bg-positive text-on-accent flex items-center justify-center font-extrabold text-lg shadow-md">
            3
          </span>
          <span className="text-xs font-semibold text-muted bg-elevated px-2.5 py-1 rounded-md border border-line">
            Evolução
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Acompanhe metas e relatórios</h3>
        <p className="text-sm text-secondary leading-relaxed mb-4">
          Veja o percentual das suas metas crescendo e analise onde você pode economizar mais a cada mês.
        </p>
        <div className="mt-auto pt-4 border-t border-line/60 text-xs text-muted flex items-center gap-2">
          <CheckCircle2 size={14} className="text-positive" />
          <span>Decisões embasadas em números reais</span>
        </div>
      </div>
    </div>
  </section>);
}
