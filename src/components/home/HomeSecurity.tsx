import { ShieldCheck, Lock, KeyRound } from 'lucide-react';

export function HomeSecurity() {
  return (<section id="seguranca" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 w-full border-t border-line">
    <div data-reveal="scale" className="rounded-3xl bg-surface border border-line-strong p-8 sm:p-12 lg:p-16 shadow-lg relative overflow-hidden">
      {/* Ambient Shield Glow */}
      <div data-parallax="-2" className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div data-reveal-stagger className="max-w-3xl relative z-10">
        <div data-reveal="up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-positive/10 text-positive text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck size={16} />
          <span>SEGURANÇA EM PRIMEIRO LUGAR</span>
        </div>
        <h2 data-reveal="up" className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
          Proteção no acesso à sua conta.
        </h2>
        <p data-reveal="up" className="text-secondary text-base leading-relaxed mb-8">
          Seus registros são associados à sua conta e o acesso exige autenticação. Em ambientes publicados com HTTPS, a conexão também protege os dados durante o transporte.
        </p>

        {/* 3 Pilares Técnicos de Segurança */}
        <div data-reveal-stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-line">
          <div data-reveal="up" className="flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent-ink flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Sessões com validade</h3>
            <p className="text-xs text-muted leading-relaxed">
              O acesso tem prazo de validade. Redefinir a senha encerra as sessões anteriores.
            </p>
          </div>

          <div data-reveal="up" className="flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-info/15 text-info flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Senhas protegidas</h3>
            <p className="text-xs text-muted leading-relaxed">
              Sua senha é armazenada como hash com salt, em vez de texto puro.
            </p>
          </div>

          <div data-reveal="up" className="flex flex-col gap-2">
            <div className="w-9 h-9 rounded-xl bg-positive/10 text-positive flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Proteção de Identidade</h3>
            <p className="text-xs text-muted leading-relaxed">
              Compatibilidade com autenticação segura via Google OAuth 2.0 e recuperação restrita por e-mail.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>);
}
