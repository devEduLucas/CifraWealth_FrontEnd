import { Sparkles } from 'lucide-react';

export function HomePrinciples() {
  return (<section id="principios" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-line">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Bloco de Apresentação da Filosofia */}
      <div className="lg:col-span-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple/10 text-purple text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={14} />
          <span>FILOSOFIA CIFRAWEALTH</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-5">
          Clareza sem fórmulas mágicas.
        </h2>
        <p className="text-secondary text-base leading-relaxed mb-6">
          Acreditamos que tranquilidade financeira não nasce de promessas de ganhos rápidos, mas sim da consciência honesta de para onde cada centavo está indo.
        </p>
        <div className="p-4 rounded-xl bg-elevated border border-line">
          <p className="text-xs text-muted leading-relaxed italic">
            "Quando você tem visibilidade das suas prioridades, suas decisões deixam de ser motivadas pela ansiedade e passam a ser guiadas por intenção."
          </p>
        </div>
      </div>

      {/* Cards Conceituais */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent-ink flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
            01
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Previsibilidade sobre ansiedade
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              Saber exatamente o quanto você gasta por mês elimina surpresas no final do período e permite planejar aportes com segurança.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
          <div className="w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
            02
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Metas realizáveis e mensuráveis
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              Sonhos financeiros viram realidade quando são divididos em metas claras com acompanhamento contínuo de progresso.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-line flex items-start gap-4 hover:border-line-strong transition-all">
          <div className="w-10 h-10 rounded-xl bg-positive/10 text-positive flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm">
            03
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Soberania e privacidade dos seus dados
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              Você é o único proprietário das suas informações financeiras. Não alimentamos algoritmos de publicidade com seus registros.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>);
}
